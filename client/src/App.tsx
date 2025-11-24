import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import EmployeeDashboardPage from "@/pages/employee-dashboard";
import EmployeeTasksPage from "@/pages/employee-tasks";
import EmployeeLeavePage from "@/pages/employee-leave";
import AdminDashboardPage from "@/pages/admin-dashboard";
import AdminEmployeesPage from "@/pages/admin-employees";
import AdminTasksPage from "@/pages/admin-tasks";
import AdminLeavesPage from "@/pages/admin-leaves";
import AdminAttendancePage from "@/pages/admin-attendance";
import AdminAnalyticsPage from "@/pages/admin-analytics";
import AdminRemindersPage from "@/pages/admin-reminders";
import { getCurrentEmployee } from "@/lib/auth";

function RootRedirect() {
  const [, setLocation] = useLocation();
  const employee = getCurrentEmployee();
  
  React.useEffect(() => {
    if (employee) {
      if (employee.role === "Admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/employee/dashboard");
      }
    } else {
      setLocation("/login");
    }
  }, [employee, setLocation]);
  
  return null;
}

import React from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/employee/dashboard" component={EmployeeDashboardPage} />
      <Route path="/employee/tasks" component={EmployeeTasksPage} />
      <Route path="/employee/leave" component={EmployeeLeavePage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/employees" component={AdminEmployeesPage} />
      <Route path="/admin/tasks" component={AdminTasksPage} />
      <Route path="/admin/leaves" component={AdminLeavesPage} />
      <Route path="/admin/attendance" component={AdminAttendancePage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/reminders" component={AdminRemindersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
