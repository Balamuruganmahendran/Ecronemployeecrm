import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, User, Menu, X } from "lucide-react";
import { getCurrentEmployee, clearAuthData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { path: "/employee/dashboard", label: "Dashboard" },
  { path: "/employee/tasks", label: "Tasks" },
  { path: "/employee/leave", label: "Leave" },
];

export default function EmployeeHeader() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setMobileMenuOpen(false);
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-14 md:h-16 bg-background border-b border-border">
        <div className="h-full max-w-7xl mx-auto px-3 md:px-6 flex items-center justify-between gap-3">
          <h1 className="text-base md:text-lg font-semibold truncate">Employee LMS</h1>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs md:text-sm"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{employee?.name}</p>
                <p className="text-xs text-muted-foreground">{employee?.role}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
              title="Logout"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 flex-shrink-0"
              data-testid="button-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-background border-b border-border z-30">
          <nav className="max-w-7xl mx-auto px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-red-600 hover:text-red-700"
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="button-logout-mobile"
            >
              <LogOut className="w-4 h-4 mr-3" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}
