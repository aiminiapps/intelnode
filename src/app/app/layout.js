import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { TokenProvider } from "@/context/TokenContext";

export default function DashboardLayout({ children }) {
  return (
    <TokenProvider>
      <div className="flex min-h-screen bg-[#0A0A0F]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TokenProvider>
  );
}
