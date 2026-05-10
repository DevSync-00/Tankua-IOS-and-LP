import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <Sidebar />
      {/* w-60 = 240px sidebar */}
      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
