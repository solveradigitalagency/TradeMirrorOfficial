import DashboardSidebar from "./dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#03070d] text-white">
      <DashboardSidebar />

      <main className="min-h-screen lg:pl-[270px]">
        {children}
      </main>
    </div>
  );
}