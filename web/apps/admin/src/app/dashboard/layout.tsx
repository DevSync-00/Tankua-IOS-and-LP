import { Sidebar } from "@/components/sidebar";
import { AuthGate } from "@/components/auth-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-brand-sand">
        <Sidebar />
        {/* w-60 = 240px sidebar */}
        <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
