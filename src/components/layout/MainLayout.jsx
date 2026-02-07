import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from './Sidebar';
import { cn } from "../../lib/utils";
import { SidebarProvider, useSidebarContext } from "../../contexts/SidebarContext";

const MainContent = () => {
  const { collapsed } = useSidebarContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
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

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <MainContent />
    </SidebarProvider>
  )
}