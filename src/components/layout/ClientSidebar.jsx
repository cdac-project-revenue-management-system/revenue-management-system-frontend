import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Wallet,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Receipt,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarContext } from "../../contexts/SidebarContext";

const mainNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/client/dashboard" },
  { label: "My Subscriptions", icon: CreditCard, href: "/client/subscriptions" },
  { label: "Invoices", icon: FileText, href: "/client/invoices" },
  { label: "Payment Methods", icon: Wallet, href: "/client/payments" },
  { label: "Help & Support", icon: HelpCircle, href: "/client/support" },
];

const bottomNavItems = [
  { label: "Settings", icon: Settings, href: "/client/settings" },
  { label: "Logout", icon: LogOut, href: "/", isLogout: true },
];

export const ClientSidebar = () => {
  const { collapsed, toggleCollapsed, mobileOpen, toggleMobile, setMobileOpen } = useSidebarContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState({ fullName: "Client", companyName: "BizVenue", role: "Client" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const NavItemComponent = ({ item }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    const handleClick = (e) => {
      if (item.isLogout) {
        e.preventDefault();
        navigate("/login");
      }
      // Close mobile menu on click
      if (window.innerWidth < 768) {
        setMobileOpen(false);
      }
    };

    return (
      <NavLink
        to={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-primary/10 text-primary shadow-glow"
            : "text-sidebar-foreground hover:shadow-[0_0_12px_rgba(19,168,151,0.6)] hover:ring-1",
          item.isLogout &&
          "text-destructive hover:bg-destructive/15 hover:text-destructive hover:ring-destructive/50"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
        <span className={cn(
          "truncate animate-fade-in",
          collapsed ? "md:hidden" : "block",
          mobileOpen ? "block" : "hidden md:block"
        )}>
          {item.label}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
          collapsed ? "w-16" : "w-64",
          // Mobile responsive classes
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-20 md:h-24 flex items-center justify-center px-4 border-b border-sidebar-border overflow-hidden">
          {/* Expanded Logo (Desktop) or Mobile Logo */}
          <div className={cn(
            "items-center w-full animate-fade-in",
            (collapsed && !mobileOpen) ? "hidden" : "flex"
          )}>
            <img
              src="/bizvenue-sidebar-logo.png"
              alt="Bizvenue"
              className="w-40 md:w-[75%] object-contain object-left"
            />
          </div>
          {/* Collapsed Logo (Desktop only) or Square Logo */}
          <div className={cn(
            "w-10 h-10 items-center justify-center mx-auto animate-fade-in",
            (collapsed && !mobileOpen) ? "flex" : "hidden"
          )}>
            <img src="/bizvenue-logo.png" alt="Bizvenue" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-sidebar-border overflow-hidden">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent transition-all duration-300",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} />
              <AvatarFallback>{user.fullName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              collapsed ? "hidden" : "block"
            )}>
              <p className="text-sm font-medium text-foreground truncate" title={user.fullName}>
                {user.fullName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{user.role?.toLowerCase() || "client"}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {bottomNavItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </div>

        {/* Collapse Toggle - Only on desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-card hover:bg-secondary hidden md:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </>
  );
};
