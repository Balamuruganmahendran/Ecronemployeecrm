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

      // Redirect based on role
      if (response.employee.role === "Admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/employee/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Employee LMS</CardTitle>
            <CardDescription className="mt-2">
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="ADMIN or EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                data-testid="input-employee-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Demo accounts:</p>
              <p>Admin: ID=<code className="bg-muted px-1 rounded">ADMIN</code>, Password=<code className="bg-muted px-1 rounded">admin123</code></p>
              <p>Employee: ID=<code className="bg-muted px-1 rounded">EMP001</code>, Password=<code className="bg-muted px-1 rounded">emp123</code></p>
            </div>
            <Button
              type="submit"
              className="w-full"
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
