import { Outlet } from "react-router-dom";
import { ClientSidebar } from "./ClientSidebar";
import { Header } from "./Header";
import { SidebarProvider, useSidebarContext } from "../../contexts/SidebarContext";
import { cn } from "../../lib/utils";

const ClientContent = () => {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <ClientSidebar />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          collapsed ? "md:pl-16" : "md:pl-64",
          "pl-0"
        )}
      >
        <Header />
        <main className="p-4 md:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const ClientLayout = () => {
  return (
    <SidebarProvider>
      <ClientContent />
    </SidebarProvider>
  )
}