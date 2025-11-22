import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { getCurrentEmployee, clearAuthData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { path: "/employee/dashboard", label: "Dashboard" },
  { path: "/employee/tasks", label: "Tasks" },
  { path: "/employee/leave", label: "Leave" },
];

export default function EmployeeHeader() {
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
    <header className="sticky top-0 z-50 h-16 bg-background border-b border-border">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-semibold">Employee LMS</h1>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{employee?.name}</p>
              <p className="text-xs text-muted-foreground">{employee?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
