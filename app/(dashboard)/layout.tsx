import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
