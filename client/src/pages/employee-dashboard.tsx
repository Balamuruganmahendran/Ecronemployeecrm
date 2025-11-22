import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { Clock, Calendar, LogIn, LogOut as LogOutIcon } from "lucide-react";
import { getCurrentEmployee } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Attendance, Task, LeaveRequest } from "@shared/schema";

export default function EmployeeDashboard() {
  const employee = getCurrentEmployee();
  const { toast } = useToast();

  const { data: todayAttendance } = useQuery<Attendance | null>({
    queryKey: ["/api/attendance/today"],
  });

  const { data: workingDaysData } = useQuery<{ workingDays: number }>({
    queryKey: ["/api/attendance/working-days"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const loginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/login", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/working-days"] });
      toast({
        title: "Marked Present",
        description: "Your attendance has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/logout", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
      toast({
        title: "Logged Out",
        description: "Your logout time has been recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const isPresent = !!todayAttendance;
  const hasLoggedOut = todayAttendance?.logoutTime !== null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <EmployeeHeader />
        <main className="max-w-4xl mx-auto p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Welcome, {employee?.name}</h1>
            <p className="text-muted-foreground mt-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={isPresent ? "Present" : "Absent"} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Login Time</p>
                  <p className="text-base font-semibold tabular-nums">
                    {todayAttendance?.loginTime 
                      ? new Date(todayAttendance.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : "--:--"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Logout Time</p>
                  <p className="text-base font-semibold tabular-nums">
                    {todayAttendance?.logoutTime
                      ? new Date(todayAttendance.logoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : "--:--"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => loginMutation.mutate()}
                  disabled={loginMutation.isPending || isPresent}
                  className="flex-1 gap-2"
                  data-testid="button-mark-present"
                >
                  <LogIn className="w-4 h-4" />
                  {loginMutation.isPending ? "Marking..." : isPresent ? "Already Present" : "Mark Present"}
                </Button>
                <Button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending || !isPresent || hasLoggedOut}
                  variant="outline"
                  className="flex-1 gap-2"
                  data-testid="button-mark-logout"
                >
                  <LogOutIcon className="w-4 h-4" />
                  {logoutMutation.isPending ? "Logging out..." : hasLoggedOut ? "Logged Out" : "Mark End Time"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              label="Total Working Days"
              value={workingDaysData?.workingDays || 0}
              icon={Calendar}
            />
            <StatCard
              label="Tasks Pending"
              value={pendingTasks}
              icon={Clock}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                      </div>
                      <StatusBadge status={task.status as any} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No leave requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex-1">
                        <p className="font-medium">{request.startDate} - {request.endDate}</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                      <StatusBadge status={request.status as any} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
