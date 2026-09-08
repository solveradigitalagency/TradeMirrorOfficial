"use client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

type ConversationMember = {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
};

type ConversationPreview = Conversation & {
  otherMember: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
};

function formatTime(dateString: string | null) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function initials(profile: Profile | null) {
  if (!profile) return "?";

  const name =
    profile.display_name?.trim() ||
    profile.username?.trim() ||
    "Trader";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Avatar({
  profile,
  size = "md",
}: {
  profile: Profile | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "h-9 w-9 text-[10px]"
      : size === "lg"
        ? "h-12 w-12 text-[12px]"
        : "h-10 w-10 text-[10px]";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-gradient-to-br from-[#17273a] to-[#0b121c] font-semibold text-white/65 ${sizeClass}`}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        initials(profile)
      )}
    </div>
  );
}

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const searchParams = useSearchParams();
  const conversationParam = searchParams.get("conversation");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>(
    [],
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  // Step 3: Add attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedConversation =
    conversations.find((conversation) => {
      return conversation.id === selectedConversationId;
    }) ?? null;

  const filteredConversations = conversations.filter((conversation) => {
    const name =
      conversation.otherMember?.display_name ||
      conversation.otherMember?.username ||
      "";

    const username = conversation.otherMember?.username || "";

    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      name.toLowerCase().includes(query) ||
      username.toLowerCase().includes(query) ||
      conversation.lastMessage?.content.toLowerCase().includes(query)
    );
  });

  const loadConversations = useCallback(
    async (userId: string) => {
      const { data: memberRows, error: memberError } = await supabase
        .from("conversation_members")
        .select("id, conversation_id, user_id, joined_at")
        .eq("user_id", userId);

      if (memberError) {
        console.error("CONVERSATION MEMBERS ERROR:", memberError);
        throw memberError;
      }

      if (!memberRows?.length) {
        setConversations([]);
        return;
      }

      const conversationIds = [
        ...new Set(
          memberRows.map(
            (member: ConversationMember) => member.conversation_id,
          ),
        ),
      ];

      const { data: conversationRows, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id, created_at, updated_at")
          .in("id", conversationIds)
          .order("updated_at", { ascending: false });

      if (conversationError) {
        console.error("CONVERSATIONS ERROR:", conversationError);
        throw conversationError;
      }

      const { data: allMembers, error: allMembersError } = await supabase
        .from("conversation_members")
        .select("id, conversation_id, user_id, joined_at")
        .in("conversation_id", conversationIds);

      if (allMembersError) {
        console.error("ALL MEMBERS ERROR:", allMembersError);
        throw allMembersError;
      }

      const otherUserIds = [
        ...new Set(
          (allMembers ?? [])
            .map((member: ConversationMember) => member.user_id)
            .filter((id: string) => id !== userId),
        ),
      ];

      let profiles: Profile[] = [];

      if (otherUserIds.length) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", otherUserIds);

        if (profileError) {
          console.error("MESSAGE PROFILES ERROR:", profileError);
        } else {
          profiles = (profileRows ?? []) as Profile[];
        }
      }

      const { data: recentMessages, error: recentMessagesError } =
        await supabase
          .from("messages")
          .select(
            // Step 4: Update message queries
            "id, conversation_id, sender_id, content, created_at, read_at, attachment_url, attachment_name, attachment_type, attachment_size"
          )
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
          .limit(200);

      if (recentMessagesError) {
        console.error("RECENT MESSAGES ERROR:", recentMessagesError);
      }

      const messageRows = (recentMessages ?? []) as Message[];

      const previews: ConversationPreview[] = (
        (conversationRows ?? []) as Conversation[]
      ).map((conversation) => {
        const members = (allMembers ?? []).filter(
          (member: ConversationMember) =>
            member.conversation_id === conversation.id,
        );

        const otherMember = members.find(
          (member: ConversationMember) => member.user_id !== userId,
        );

        const profile =
          profiles.find(
            (candidate) => candidate.id === otherMember?.user_id,
          ) ?? null;

        const conversationMessages = messageRows
          .filter(
            (message) => message.conversation_id === conversation.id,
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        const lastMessage = conversationMessages[0] ?? null;

        const unreadCount = conversationMessages.filter(
          (message) =>
            message.sender_id !== userId && message.read_at === null,
        ).length;

        return {
          ...conversation,
          otherMember: profile,
          lastMessage,
          unreadCount,
        };
      });

      previews.sort(
        (a, b) =>
          new Date(
            b.lastMessage?.created_at ?? b.updated_at,
          ).getTime() -
          new Date(
            a.lastMessage?.created_at ?? a.updated_at,
          ).getTime(),
      );

      setConversations(previews);

      setSelectedConversationId((current) => {
        // If Discover sent us to a specific conversation,
        // open that conversation automatically.
        if (
          conversationParam &&
          previews.some(
            (conversation) => conversation.id === conversationParam,
          )
        ) {
          return conversationParam;
        }

        // Otherwise preserve the currently selected conversation.
        if (
          current &&
          previews.some(
            (conversation) => conversation.id === current,
          )
        ) {
          return current;
        }

        return previews[0]?.id ?? null;
      });
    },
    [supabase, conversationParam],
  );

  const loadMessages = useCallback(
    async (conversationId: string, userId: string) => {
      setLoadingMessages(true);

      const { data, error: messagesError } = await supabase
        .from("messages")
        .select(
          // Step 4: Update message queries
          "id, conversation_id, sender_id, content, created_at, read_at, attachment_url, attachment_name, attachment_type, attachment_size"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("MESSAGES ERROR:", messagesError);
        setError("We couldn't load this conversation.");
        setLoadingMessages(false);
        return;
      }

      const loadedMessages = (data ?? []) as Message[];

      setMessages(loadedMessages);
      setLoadingMessages(false);

      const unreadIds = loadedMessages
        .filter(
          (message) =>
            message.sender_id !== userId && message.read_at === null,
        )
        .map((message) => message.id);

      if (unreadIds.length) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds)
          .eq("conversation_id", conversationId);

        setMessages((current) =>
          current.map((message) =>
            unreadIds.includes(message.id)
              ? {
                  ...message,
                  read_at: new Date().toISOString(),
                }
              : message,
          ),
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );
      }
    },
    [supabase],
  );

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Please sign in again.");
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      try {
        await loadConversations(user.id);
      } catch {
        setError("We couldn't load your messages.");
      }

      setLoading(false);
    }

    initialize();
  }, [supabase, loadConversations]);

  useEffect(() => {
    if (!selectedConversationId || !currentUserId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversationId, currentUserId);
  }, [
    selectedConversationId,
    currentUserId,
    loadMessages,
  ]);

  useEffect(() => {
    if (
      conversationParam &&
      selectedConversationId === conversationParam
    ) {
      setMobileConversationOpen(true);
    }
  }, [conversationParam, selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        async (payload) => {
          const incomingMessage = payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (message) => message.id === incomingMessage.id,
              )
            ) {
              return current;
            }

            return [...current, incomingMessage];
          });

          setConversations((current) =>
            current
              .map((conversation) =>
                conversation.id === selectedConversationId
                  ? {
                      ...conversation,
                      lastMessage: incomingMessage,
                      updated_at: incomingMessage.created_at,
                      unreadCount:
                        incomingMessage.sender_id === currentUserId
                          ? conversation.unreadCount
                          : 0,
                    }
                  : conversation,
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.lastMessage?.created_at ?? b.updated_at,
                  ).getTime() -
                  new Date(
                    a.lastMessage?.created_at ?? a.updated_at,
                  ).getTime(),
              ),
          );

          if (
            incomingMessage.sender_id !== currentUserId &&
            incomingMessage.read_at === null
          ) {
            await supabase
              .from("messages")
              .update({
                read_at: new Date().toISOString(),
              })
              .eq("id", incomingMessage.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedConversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (mobileConversationOpen) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [mobileConversationOpen]);

  // Step 5: Replace sendMessage()
  async function sendMessage() {
    const content = messageText.trim();

    if (
      (!content && !selectedFile) ||
      !currentUserId ||
      !selectedConversationId ||
      sending ||
      uploadingFile
    ) {
      return;
    }

    setSending(true);
    setError("");

    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;
    let attachmentSize: number | null = null;

    try {
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("Files must be 10 MB or smaller.");
          setSending(false);
          return;
        }

        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
          "application/pdf",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
          setError("That file type isn't supported.");
          setSending(false);
          return;
        }

        setUploadingFile(true);

        const fileExtension =
          selectedFile.name.split(".").pop()?.toLowerCase() || "file";

        const fileName = `${crypto.randomUUID()}.${fileExtension}`;

        const filePath = `${currentUserId}/${selectedConversationId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedFile.type,
          });

        if (uploadError) {
          console.error("MESSAGE ATTACHMENT ERROR:", uploadError);
          setError("The file couldn't be uploaded.");
          setSending(false);
          setUploadingFile(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("message-attachments")
          .getPublicUrl(filePath);

        attachmentUrl = publicUrl;
        attachmentName = selectedFile.name;
        attachmentType = selectedFile.type;
        attachmentSize = selectedFile.size;

        setUploadingFile(false);
      }

      const { data, error: sendError } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversationId,
          sender_id: currentUserId,
          content,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType,
          attachment_size: attachmentSize,
        })
        .select(
          "id, conversation_id, sender_id, content, created_at, read_at, attachment_url, attachment_name, attachment_type, attachment_size",
        )
        .single();

      if (sendError) {
        console.error("SEND MESSAGE ERROR:", sendError);
        setError("Your message couldn't be sent.");
        setSending(false);
        return;
      }

      const sentMessage = data as Message;

      setMessages((current) => {
        if (current.some((message) => message.id === sentMessage.id)) {
          return current;
        }

        return [...current, sentMessage];
      });

      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.id === selectedConversationId
              ? {
                  ...conversation,
                  lastMessage: sentMessage,
                  updated_at: sentMessage.created_at,
                }
              : conversation,
          )
          .sort(
            (a, b) =>
              new Date(
                b.lastMessage?.created_at ?? b.updated_at,
              ).getTime() -
              new Date(
                a.lastMessage?.created_at ?? a.updated_at,
              ).getTime(),
          ),
      );

      setMessageText("");
      setSelectedFile(null);
      setSending(false);
      setUploadingFile(false);

      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 50);

    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      setError("Your message couldn't be sent.");
      setSending(false);
      setUploadingFile(false);
    }
  }

  function handleMessageKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function selectConversation(id: string) {
    setSelectedConversationId(id);
    setMobileConversationOpen(true);
    setError("");
  }

  const selectedMessages = messages;

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#03070d] text-white">
        <div className="flex items-center gap-3 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[12px]">Loading messages...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#03070d] px-4 py-4 text-white lg:px-5">
      <div className="mx-auto flex h-full max-w-[1500px] flex-col">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.035em] text-white">
              Messages
            </h1>

            <p className="mt-1 text-[11px] text-white/30">
              Talk with traders across TradeMirror.
            </p>
          </div>

          <div className="hidden items-center rounded-lg border border-white/[0.07] bg-[#08111a] px-3 py-2 text-[10px] text-white/35 sm:flex">
            <MessageCircle className="mr-2 h-3.5 w-3.5 text-blue-400/70" />
            {conversations.length}{" "}
            {conversations.length === 1
              ? "conversation"
              : "conversations"}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-3 shrink-0 rounded-lg border border-red-400/15 bg-red-500/[0.06] px-3 py-2 text-[10px] text-red-300/80">
            {error}
          </div>
        )}

        {/* MESSAGES SURFACE */}
        <section className="mt-4 min-h-0 flex-1 overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#050b13]/90 shadow-[0_30px_90px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.025)]">
          <div className="flex h-full min-h-0">
            {/* CONVERSATION LIST */}
            <aside
              className={`flex w-full shrink-0 flex-col border-r border-white/[0.06] bg-[#071019]/80 md:w-[310px] ${
                mobileConversationOpen ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="border-b border-white/[0.055] p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search messages..."
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#0a131d] pl-9 pr-3 text-[11px] text-white/75 outline-none transition placeholder:text-white/25 focus:border-blue-400/25 focus:bg-[#0c1621]"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                      <MessageCircle className="h-5 w-5 text-white/20" />
                    </div>

                    <p className="mt-4 text-[12px] font-medium text-white/55">
                      {search
                        ? "No conversations found"
                        : "No messages yet"}
                    </p>

                    <p className="mt-1.5 max-w-[210px] text-[10px] leading-5 text-white/25">
                      Discover traders and send them a message to start a
                      conversation.
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map((conversation) => {
                      const active =
                        conversation.id === selectedConversationId;

                      const displayName =
                        conversation.otherMember?.display_name ||
                        conversation.otherMember?.username ||
                        "Trader";

                      const username =
                        conversation.otherMember?.username;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() =>
                            selectConversation(conversation.id)
                          }
                          className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            active
                              ? "border border-blue-400/10 bg-blue-500/[0.075]"
                              : "border border-transparent hover:bg-white/[0.025]"
                          }`}
                        >
                          <Avatar
                            profile={conversation.otherMember}
                            size="md"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[11px] font-semibold text-white/75">
                                {displayName}
                              </p>

                              <span className="shrink-0 text-[9px] text-white/25">
                                {formatTime(
                                  conversation.lastMessage?.created_at ??
                                    conversation.updated_at,
                                )}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="truncate text-[10px] text-white/30">
                                {conversation.lastMessage
                                  ? conversation.lastMessage.sender_id ===
                                    currentUserId
                                    ? `You: ${conversation.lastMessage.content}`
                                    : conversation.lastMessage.content
                                  : username
                                    ? `@${username}`
                                    : "Start a conversation"}
                              </p>

                              {conversation.unreadCount > 0 && (
                                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#2385f5] px-1 text-[8px] font-bold text-white">
                                  {conversation.unreadCount > 9
                                    ? "9+"
                                    : conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* ACTIVE CONVERSATION */}
            <section
              className={`min-w-0 flex-1 flex-col ${
                mobileConversationOpen ? "flex" : "hidden md:flex"
              }`}
            >
              {!selectedConversation ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-3xl bg-blue-500/[0.08] blur-2xl" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#0b1520] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                      <MessageCircle className="h-7 w-7 text-blue-400/60" />
                    </div>
                  </div>

                  <h2 className="mt-5 text-[15px] font-semibold text-white/70">
                    Your messages
                  </h2>

                  <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-white/25">
                    Select a conversation from the left or discover a trader
                    and send them a message.
                  </p>
                </div>
              ) : (
                <>
                  {/* CONVERSATION HEADER */}
                  <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.055] bg-[#071019]/70 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileConversationOpen(false)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-white/40 transition hover:bg-white/[0.05] hover:text-white md:hidden"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>

                    <Avatar
                      profile={selectedConversation.otherMember}
                      size="md"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-white/80">
                        {selectedConversation.otherMember
                          ?.display_name ||
                          selectedConversation.otherMember?.username ||
                          "Trader"}
                      </p>

                      {selectedConversation.otherMember?.username && (
                        <p className="mt-0.5 truncate text-[9px] text-white/30">
                          @
                          {selectedConversation.otherMember.username}
                        </p>
                      )}
                    </div>
                  </header>

                  {/* MESSAGE AREA */}
                  <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#040a11] px-4 py-5 sm:px-6">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute left-[30%] top-[-200px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.018] blur-[130px]" />
                    </div>

                    {loadingMessages ? (
                      <div className="relative flex h-full items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-white/25" />
                      </div>
                    ) : selectedMessages.length === 0 ? (
                      <div className="relative flex h-full flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                          <UserRound className="h-4 w-4 text-white/20" />
                        </div>

                        <p className="mt-3 text-[11px] font-medium text-white/45">
                          Start the conversation
                        </p>

                        <p className="mt-1 max-w-[240px] text-[9px] leading-5 text-white/20">
                          Send a message to{" "}
                          {selectedConversation.otherMember
                            ?.display_name ||
                            selectedConversation.otherMember?.username ||
                            "this trader"}
                          .
                        </p>
                      </div>
                    ) : (
                      <div className="relative mx-auto flex max-w-[760px] flex-col gap-2">
                        {selectedMessages.map((message, index) => {
                          const isMine =
                            message.sender_id === currentUserId;

                          const previous = selectedMessages[index - 1];

                          const sameSender =
                            previous?.sender_id === message.sender_id;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isMine
                                  ? "justify-end"
                                  : "justify-start"
                              } ${sameSender ? "mt-0.5" : "mt-2"}`}
                            >
                              <div
                                className={`max-w-[78%] sm:max-w-[65%] ${
                                  isMine
                                    ? "items-end"
                                    : "items-start"
                                } flex flex-col`}
                              >
                                <div
                                  className={`rounded-[16px] px-3.5 py-2.5 text-[11px] leading-5 ${
                                    isMine
                                      ? "rounded-br-[5px] bg-[#2385f5] text-white shadow-[0_8px_25px_rgba(35,133,245,0.14)]"
                                      : "rounded-bl-[5px] border border-white/[0.065] bg-[#0b151f] text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                                  }`}
                                >
                                  {/* Step 9: Render images and attachments */}
                                  {message.attachment_url && (
                                    <a
                                      href={message.attachment_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mb-2 block overflow-hidden rounded-[11px]"
                                    >
                                      {message.attachment_type?.startsWith("image/") ? (
                                        <img
                                          src={message.attachment_url}
                                          alt={message.attachment_name || "Attachment"}
                                          className="max-h-[360px] w-full max-w-[420px] object-cover transition hover:opacity-90"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-3 bg-black/[0.12] px-3 py-3">
                                          <Paperclip className="h-4 w-4 shrink-0" />
                                          <div className="min-w-0">
                                            <p className="truncate text-[10px] font-medium">
                                              {message.attachment_name || "Attachment"}
                                            </p>
                                            {message.attachment_size && (
                                              <p className="mt-0.5 text-[8px] opacity-50">
                                                {(message.attachment_size / 1024 / 1024).toFixed(2)} MB
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </a>
                                  )}

                                  {message.content && (
                                    <div>{message.content}</div>
                                  )}
                                </div>

                                <div
                                  className={`mt-1 flex items-center gap-1.5 px-1 text-[8px] ${
                                    isMine
                                      ? "text-white/20"
                                      : "text-white/20"
                                  }`}
                                >
                                  <span>
                                    {formatTime(
                                      message.created_at,
                                    )}
                                  </span>

                                  {isMine &&
                                    (message.read_at ? (
                                      <CheckCheck className="h-3 w-3 text-blue-400/70" />
                                    ) : (
                                      <Check className="h-3 w-3 text-white/20" />
                                    ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* COMPOSER */}
                  <div className="shrink-0 border-t border-white/[0.055] bg-[#071019]/75 p-3 sm:p-4">
                    {/* Step 7: Show the selected file before sending */}
                    {selectedFile && (
                      <div className="mx-auto mb-2 flex max-w-[760px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0a141e] px-3 py-2.5">
                        {selectedFile.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 shrink-0 text-blue-400/70" />
                        ) : (
                          <Paperclip className="h-4 w-4 shrink-0 text-blue-400/70" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium text-white/65">
                            {selectedFile.name}
                          </p>

                          <p className="mt-0.5 text-[8px] text-white/25">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.05] hover:text-white/70"
                          title="Remove attachment"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="mx-auto flex max-w-[760px] items-end gap-2 rounded-[14px] border border-white/[0.075] bg-[#0a141e] p-1.5 shadow-[0_15px_45px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.02)] transition focus-within:border-blue-400/20">
                      {/* Step 6: Add the file picker */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;

                          if (!file) return;

                          if (file.size > 10 * 1024 * 1024) {
                            setError("Files must be 10 MB or smaller.");
                            event.target.value = "";
                            return;
                          }

                          setSelectedFile(file);
                          setError("");
                          event.target.value = "";
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white/30 transition hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-40"
                        title="Attach a file"
                      >
                        <Paperclip className="h-4 w-4" strokeWidth={1.8} />
                      </button>

                      <textarea
                        ref={messageInputRef}
                        value={messageText}
                        onChange={(event) =>
                          setMessageText(event.target.value)
                        }
                        onKeyDown={handleMessageKeyDown}
                        placeholder="Write a message..."
                        rows={1}
                        disabled={sending || uploadingFile}
                        className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[11px] leading-5 text-white/75 outline-none placeholder:text-white/25 disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={
                          (!messageText.trim() && !selectedFile) ||
                          sending ||
                          uploadingFile
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#2385f5] text-white shadow-[0_7px_20px_rgba(35,133,245,0.18)] transition hover:bg-[#318ff7] disabled:cursor-not-allowed disabled:bg-white/[0.05] disabled:text-white/20 disabled:shadow-none"
                      >
                        {sending || uploadingFile ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send
                            className="h-3.5 w-3.5"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    </div>

                    <p className="mx-auto mt-2 max-w-[760px] px-1 text-[8px] text-white/15">
                      Press Enter to send · Shift + Enter for a new line
                    </p>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}