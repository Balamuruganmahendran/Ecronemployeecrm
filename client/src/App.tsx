import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployeeTasksPage from "@/pages/employee-tasks";
import EmployeeLeavePage from "@/pages/employee-leave";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminEmployeesPage from "@/pages/admin-employees";
import AdminTasksPage from "@/pages/admin-tasks";
import AdminLeavesPage from "@/pages/admin-leaves";
import AdminAttendancePage from "@/pages/admin-attendance";
import AdminAnalyticsPage from "@/pages/admin-analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={LoginPage} />
      
      <Route path="/employee/dashboard" component={EmployeeDashboard} />
      <Route path="/employee/tasks" component={EmployeeTasksPage} />
      <Route path="/employee/leave" component={EmployeeLeavePage} />
      
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/employees" component={AdminEmployeesPage} />
      <Route path="/admin/tasks" component={AdminTasksPage} />
      <Route path="/admin/leaves" component={AdminLeavesPage} />
      <Route path="/admin/attendance" component={AdminAttendancePage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
