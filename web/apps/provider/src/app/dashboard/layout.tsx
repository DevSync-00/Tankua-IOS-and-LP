import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-sand">
      <Sidebar />
      {/* w-60 = 240px sidebar; pt-14 accounts for mobile hamburger header area */}
      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
