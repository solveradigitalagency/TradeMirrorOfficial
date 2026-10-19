
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
  Suspense,
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
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.09] bg-[#202020] font-semibold tracking-wide text-white/70 ${sizeClass}`}
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

function MessagesContent() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get("conversation");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

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
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

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
          memberRows.map((member: ConversationMember) => member.conversation_id),
        ),
      ];

      const { data: conversationRows, error: conversationError } = await supabase
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

      const { data: recentMessages, error: recentMessagesError } = await supabase
        .from("messages")
        .select(
          "id, conversation_id, sender_id, content, created_at, read_at, attachment_url, attachment_name, attachment_type, attachment_size",
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
          profiles.find((candidate) => candidate.id === otherMember?.user_id) ?? null;

        const conversationMessages = messageRows
          .filter((message) => message.conversation_id === conversation.id)
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
          new Date(b.lastMessage?.created_at ?? b.updated_at).getTime() -
          new Date(a.lastMessage?.created_at ?? a.updated_at).getTime(),
      );

      setConversations(previews);

      setSelectedConversationId((current) => {
        if (
          conversationParam &&
          previews.some((conversation) => conversation.id === conversationParam)
        ) {
          return conversationParam;
        }

        if (current && previews.some((conversation) => conversation.id === current)) {
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
          "id, conversation_id, sender_id, content, created_at, read_at, attachment_url, attachment_name, attachment_type, attachment_size",
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
        const readAt = new Date().toISOString();

        await supabase
          .from("messages")
          .update({ read_at: readAt })
          .in("id", unreadIds)
          .eq("conversation_id", conversationId);

        setMessages((current) =>
          current.map((message) =>
            unreadIds.includes(message.id)
              ? { ...message, read_at: readAt }
              : message,
          ),
        );

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unreadCount: 0 }
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
  }, [selectedConversationId, currentUserId, loadMessages]);

  useEffect(() => {
    if (conversationParam && selectedConversationId === conversationParam) {
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
            if (current.some((message) => message.id === incomingMessage.id)) {
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
                  new Date(b.lastMessage?.created_at ?? b.updated_at).getTime() -
                  new Date(a.lastMessage?.created_at ?? a.updated_at).getTime(),
              ),
          );

          if (
            incomingMessage.sender_id !== currentUserId &&
            incomingMessage.read_at === null
          ) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (mobileConversationOpen) {
      setTimeout(() => messageInputRef.current?.focus(), 100);
    }
  }, [mobileConversationOpen]);

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
              new Date(b.lastMessage?.created_at ?? b.updated_at).getTime() -
              new Date(a.lastMessage?.created_at ?? a.updated_at).getTime(),
          ),
      );

      setMessageText("");
      setSelectedFile(null);
      setSending(false);
      setUploadingFile(false);

      setTimeout(() => messageInputRef.current?.focus(), 50);
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
      <main className="flex h-screen items-center justify-center bg-background text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#101010] px-5 py-4 text-white/40 shadow-xl">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[12px]">Loading messages...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-background px-2 py-2 text-white sm:px-4 sm:py-4 lg:px-5">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">
        {/* PAGE HEADER */}
        <header className="flex shrink-0 items-center justify-between gap-4 px-1 pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.09] bg-[#151515]">
                <MessageCircle className="h-4 w-4 text-white/75" />
              </div>
              <h1 className="text-[20px] font-semibold tracking-[-0.045em] text-white sm:text-[23px]">
                Messages
              </h1>
            </div>
            <p className="mt-1.5 pl-0.5 text-[11px] text-white/35">
              Your conversations with the TradeMirror community.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#111111] px-3.5 py-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            <span className="text-[10px] text-white/50">
              {conversations.length}{" "}
              {conversations.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-3 shrink-0 rounded-xl border border-white/[0.1] bg-[#171717] px-4 py-3 text-[11px] text-white/70">
            {error}
          </div>
        )}

        {/* MESSAGES APP */}
        <section className="min-h-0 flex-1 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0d0d0d] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex h-full min-h-0">
            {/* CONVERSATION SIDEBAR */}
            <aside
              className={`flex w-full shrink-0 flex-col border-r border-white/[0.07] bg-[#101010] md:w-[300px] lg:w-[330px] ${
                mobileConversationOpen ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="border-b border-white/[0.06] p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold tracking-[0.02em] text-white/80">
                    All conversations
                  </h2>
                  <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[9px] tabular-nums text-white/40">
                    {conversations.length}
                  </span>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search conversations"
                    className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#171717] pl-9 pr-3 text-[11px] text-white/80 outline-none transition placeholder:text-white/30 hover:border-white/[0.13] focus:border-white/25 focus:bg-[#1a1a1a]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-white/35 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                  <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-7 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
                      <MessageCircle className="h-5 w-5 text-white/30" />
                    </div>
                    <p className="mt-4 text-[12px] font-medium text-white/70">
                      {search ? "No conversations found" : "No messages yet"}
                    </p>
                    <p className="mt-2 max-w-[220px] text-[10px] leading-5 text-white/35">
                      {search
                        ? "Try another name, username, or message."
                        : "Discover traders and send someone a message to get started."}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const active = conversation.id === selectedConversationId;
                    const displayName =
                      conversation.otherMember?.display_name ||
                      conversation.otherMember?.username ||
                      "Trader";
                    const username = conversation.otherMember?.username;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => selectConversation(conversation.id)}
                        className={`group relative mb-1 flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition duration-200 ${
                          active
                            ? "border-white/[0.11] bg-white/[0.065]"
                            : "border-transparent hover:border-white/[0.055] hover:bg-white/[0.03]"
                        }`}
                      >
                        {active && (
                          <span className="absolute bottom-3 left-0 top-3 w-[2px] rounded-full bg-white/80" />
                        )}

                        <Avatar profile={conversation.otherMember} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[11px] font-semibold text-white/85">
                              {displayName}
                            </p>
                            <span className="shrink-0 text-[9px] text-white/35">
                              {formatTime(
                                conversation.lastMessage?.created_at ??
                                  conversation.updated_at,
                              )}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] text-white/40">
                              {conversation.lastMessage
                                ? conversation.lastMessage.sender_id === currentUserId
                                  ? `You: ${conversation.lastMessage.content || (conversation.lastMessage.attachment_name ? "Attachment" : "")}`
                                  : conversation.lastMessage.content ||
                                    (conversation.lastMessage.attachment_name ? "Attachment" : "")
                                : username
                                  ? `@${username}`
                                  : "Start a conversation"}
                            </p>

                            {conversation.unreadCount > 0 && (
                              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black">
                                {conversation.unreadCount > 9
                                  ? "9+"
                                  : conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/[0.06] px-4 py-3">
                <p className="text-[9px] text-white/25">
                  Private conversations · TradeMirror
                </p>
              </div>
            </aside>

            {/* CHAT PANEL */}
            <section
              className={`min-w-0 flex-1 flex-col bg-[#0c0c0c] ${
                mobileConversationOpen ? "flex" : "hidden md:flex"
              }`}
            >
              {!selectedConversation ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-white/[0.09] bg-[#151515] shadow-[0_16px_45px_rgba(0,0,0,0.2)]">
                    <MessageCircle className="h-7 w-7 text-white/45" strokeWidth={1.4} />
                  </div>
                  <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.025em] text-white/80">
                    Your messages
                  </h2>
                  <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-white/35">
                    Select a conversation or discover another trader to start chatting.
                  </p>
                </div>
              ) : (
                <>
                  {/* CHAT HEADER */}
                  <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#101010] px-3.5 py-3 sm:px-5 sm:py-4">
                    <button
                      type="button"
                      onClick={() => setMobileConversationOpen(false)}
                      aria-label="Back to conversations"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 transition hover:bg-white/[0.07] hover:text-white md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <Avatar profile={selectedConversation.otherMember} size="lg" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-semibold text-white/90">
                        {selectedConversation.otherMember?.display_name ||
                          selectedConversation.otherMember?.username ||
                          "Trader"}
                      </p>
                      {selectedConversation.otherMember?.username && (
                        <p className="mt-1 truncate text-[10px] text-white/40">
                          @{selectedConversation.otherMember.username}
                        </p>
                      )}
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span className="text-[9px] text-white/40">Conversation</span>
                    </div>
                  </header>

                  {/* MESSAGE HISTORY */}
                  <div className="relative min-h-0 flex-1 overflow-y-auto bg-[#0c0c0c] px-3 py-5 sm:px-6 sm:py-6">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute left-[25%] top-[-220px] h-[440px] w-[440px] rounded-full bg-white/[0.018] blur-[140px]" />
                    </div>

                    {loadingMessages ? (
                      <div className="relative flex h-full items-center justify-center">
                        <div className="flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-[#141414] px-4 py-2.5 text-white/35">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-[10px]">Loading conversation</span>
                        </div>
                      </div>
                    ) : selectedMessages.length === 0 ? (
                      <div className="relative flex h-full flex-col items-center justify-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#151515]">
                          <UserRound className="h-5 w-5 text-white/35" />
                        </div>
                        <p className="mt-4 text-[12px] font-medium text-white/70">
                          Start the conversation
                        </p>
                        <p className="mt-1.5 max-w-[250px] text-[10px] leading-5 text-white/35">
                          Send a message to{" "}
                          {selectedConversation.otherMember?.display_name ||
                            selectedConversation.otherMember?.username ||
                            "this trader"}{" "}
                          to get things started.
                        </p>
                      </div>
                    ) : (
                      <div className="relative mx-auto flex max-w-[780px] flex-col gap-1">
                        {selectedMessages.map((message, index) => {
                          const isMine = message.sender_id === currentUserId;
                          const previous = selectedMessages[index - 1];
                          const next = selectedMessages[index + 1];
                          const sameSender = previous?.sender_id === message.sender_id;
                          const nextSameSender = next?.sender_id === message.sender_id;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                              } ${sameSender ? "mt-0.5" : "mt-3"}`}
                            >
                              <div
                                className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${
                                  isMine ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className={`overflow-hidden rounded-[17px] px-3.5 py-2.5 text-[11px] leading-[1.7] sm:px-4 ${
                                    isMine
                                      ? `bg-white text-[#111111] ${
                                          nextSameSender
                                            ? "rounded-br-[8px]"
                                            : "rounded-br-[5px]"
                                        }`
                                      : `border border-white/[0.08] bg-[#191919] text-white/80 ${
                                          nextSameSender
                                            ? "rounded-bl-[8px]"
                                            : "rounded-bl-[5px]"
                                        }`
                                  }`}
                                >
                                  {message.attachment_url && (
                                    <a
                                      href={message.attachment_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`mb-2 block overflow-hidden rounded-[11px] ${
                                        isMine ? "bg-black/[0.04]" : "bg-black/20"
                                      }`}
                                    >
                                      {message.attachment_type?.startsWith("image/") ? (
                                        <img
                                          src={message.attachment_url}
                                          alt={message.attachment_name || "Attachment"}
                                          className="max-h-[360px] w-full max-w-[420px] object-contain transition-opacity hover:opacity-90"
                                        />
                                      ) : (
                                        <div className="flex items-center gap-3 px-3 py-3">
                                          <Paperclip className="h-4 w-4 shrink-0" />
                                          <div className="min-w-0">
                                            <p className="truncate text-[10px] font-medium">
                                              {message.attachment_name || "Attachment"}
                                            </p>
                                            {message.attachment_size && (
                                              <p className="mt-1 text-[9px] opacity-55">
                                                {(message.attachment_size / 1024 / 1024).toFixed(2)} MB
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </a>
                                  )}

                                  {message.content && (
                                    <div className="whitespace-pre-wrap break-words">
                                      {message.content}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[9px] text-white/30">
                                  <span>{formatTime(message.created_at)}</span>
                                  {isMine &&
                                    (message.read_at ? (
                                      <CheckCheck className="h-3 w-3 text-white/60" />
                                    ) : (
                                      <Check className="h-3 w-3 text-white/25" />
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

                  {/* MESSAGE COMPOSER */}
                  <footer className="shrink-0 border-t border-white/[0.07] bg-[#101010] px-3 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-4">
                    {selectedFile && (
                      <div className="mx-auto mb-3 flex max-w-[780px] items-center gap-3 rounded-xl border border-white/[0.08] bg-[#181818] px-3 py-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.035]">
                          {selectedFile.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4 text-white/65" />
                          ) : (
                            <Paperclip className="h-4 w-4 text-white/65" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium text-white/75">
                            {selectedFile.name}
                          </p>
                          <p className="mt-1 text-[9px] text-white/35">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to send
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          aria-label="Remove attachment"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.07] hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="mx-auto flex max-w-[780px] items-end gap-2 rounded-[17px] border border-white/[0.09] bg-[#191919] p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.16)] transition focus-within:border-white/[0.2]">
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
                        aria-label="Attach a file"
                        title="Attach a file"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white/85 disabled:opacity-40"
                      >
                        <Paperclip className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </button>

                      <textarea
                        ref={messageInputRef}
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={handleMessageKeyDown}
                        placeholder="Write a message..."
                        rows={1}
                        disabled={sending || uploadingFile}
                        className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[11px] leading-5 text-white/85 outline-none placeholder:text-white/30 disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={
                          (!messageText.trim() && !selectedFile) ||
                          sending ||
                          uploadingFile
                        }
                        aria-label="Send message"
                        title="Send message"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/20"
                      >
                        {sending || uploadingFile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" strokeWidth={2} />
                        )}
                      </button>
                    </div>

                    <p className="mx-auto mt-2.5 max-w-[780px] px-1 text-[9px] text-white/25">
                      Enter to send <span className="px-1 text-white/15">·</span> Shift + Enter for a new line
                    </p>
                  </footer>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen items-center justify-center bg-background text-white">
          <Loader2 className="h-4 w-4 animate-spin text-white/40" />
        </main>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
