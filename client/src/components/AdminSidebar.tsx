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
import { Separator } from "@/components/ui/separator";
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
  const { toast } = useToast();
  const employee = getCurrentEmployee();

  const handleLogout = () => {
    clearAuthData();
    setLocation("/login");
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground">Employee LMS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-10 pl-4 ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                }`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{employee?.name}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 pl-4"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
