import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { TokenProvider } from "@/context/TokenContext";

export default function DashboardLayout({ children }) {
  return (
    <TokenProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />
        {/* Crosshatch pattern strip between sidebar and content */}
        <div className="relative -right-px col-start-2 row-span-full row-start-1 hidden lg:block border-x border-x-[--pattern-fg] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed" style={{ width: '17px' }}></div>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-[#F8F9FB]">
            {children}
          </main>
        </div>
      </div>
    </TokenProvider>
  );
}
