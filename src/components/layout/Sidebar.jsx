import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  Receipt,
  Layers,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSidebarContext } from "../../contexts/SidebarContext";

const mainNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Products", icon: Package, href: "/products" },
  { label: "Plans", icon: Layers, href: "/plans" },
  { label: "Subscriptions", icon: CreditCard, href: "/subscriptions" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Invoices", icon: FileText, href: "/invoices" },
  { label: "Analytics", icon: TrendingUp, href: "/analytics" },
];

const bottomNavItems = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Logout", icon: LogOut, href: "/", isLogout: true },
];

export const Sidebar = () => {
  const { collapsed, toggleCollapsed, mobileOpen, toggleMobile, setMobileOpen } = useSidebarContext();
  const location = useLocation();
  const navigate = useNavigate();

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
    }

    return (
      <NavLink
        to={item.href}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-primary/10 text-primary shadow-glow "
            : "text-sidebar-foreground hover:shadow-[0_0_12px_rgba(19, 168, 151, 0.6)] hover:ring-1",
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
        <span className={cn(
          "ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full",
          (!collapsed || (mobileOpen)) ? "block" : "hidden"
        )}>
          {item.badge}
        </span>
      </NavLink>
    );
  };

  /* Company Selector */
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyName = user.companyName || "Acme Corp";
  const role = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Admin";

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

        {/* Company Selector */}
        <div className="p-4 border-b border-sidebar-border overflow-hidden">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent transition-all duration-300",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <div className="w-8 h-8 rounded-lg bg-info/20 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-info" />
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              collapsed ? "hidden" : "block"
            )}>
              <p className="text-sm font-medium text-foreground truncate">
                {companyName}
              </p>
              <p className="text-xs text-muted-foreground">{role}</p>
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
