import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { setAuthData } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        employeeId,
        password,
      });

      setAuthData(response);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.employee.name}!`,
      });

      if (response.employee.role === "Admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/employee/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 md:space-y-4 text-center p-4 md:p-6">
          <div className="mx-auto w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl font-semibold">Employee CRM</CardTitle>
            <CardDescription className="mt-1 md:mt-2 text-xs md:text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="employeeId" className="text-xs md:text-sm">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="ADMIN or EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={isLoading}
                className="text-xs md:text-sm"
                data-testid="input-employee-id"
              />
            </div>
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="text-xs md:text-sm"
                data-testid="input-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full text-sm md:text-base"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
