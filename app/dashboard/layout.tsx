
import DashboardSidebar from "./dashboard-sidebar";
import MobileNav from "./mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardSidebar />

      <main className="min-h-screen pb-24 lg:pb-0 lg:pl-[270px]">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
