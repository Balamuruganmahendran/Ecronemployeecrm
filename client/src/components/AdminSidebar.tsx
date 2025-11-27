import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  History,
  BarChart3,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentEmployee, clearAuthData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/employees", label: "Employees", icon: Users },
  { path: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { path: "/admin/leaves", label: "Leave Requests", icon: CalendarCheck },
  { path: "/admin/attendance", label: "Attendance", icon: History },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/reminders", label: "Reminders", icon: Bell },
];

export default function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const employee = getCurrentEmployee();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      clearAuthData();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      setTimeout(() => setLocation("/login"), 100);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="hidden md:flex md:flex-col w-full md:w-64 bg-sidebar border-r border-sidebar-border md:h-screen md:min-h-screen">
      <div className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-sidebar-border">
        <h1 className="text-base md:text-lg font-semibold text-sidebar-foreground truncate">Employee LMS</h1>
      </div>

      <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-9 md:h-10 pl-3 md:pl-4 text-xs md:text-sm ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-3 md:px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
            <p className="text-xs md:text-sm font-medium text-sidebar-foreground truncate">{employee?.name}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 h-9 md:h-10 pl-3 md:pl-4 text-xs md:text-sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="hidden lg:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </div>
  );
}
