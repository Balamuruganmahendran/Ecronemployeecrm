import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle, Bell, Calendar, LogIn, LogOut as LogOutIcon } from "lucide-react";
import { getCurrentEmployee } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Attendance, Task, Reminder } from "@shared/schema";

interface AttendanceWithName extends Attendance {
  name: string;
}

export default function EmployeeDashboard() {
  const employee = getCurrentEmployee();
  const { toast } = useToast();

  const { data: todayAttendance } = useQuery<AttendanceWithName>({
    queryKey: ["/api/attendance/today"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const loginMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/attendance/login", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
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

  const activeTasks = tasks.filter(t => t.status === "Pending");
  const completedTasks = tasks.filter(t => t.status === "Completed");
  const isPresent = !!todayAttendance;
  const hasLoggedOut = todayAttendance?.logoutTime !== null;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "High":
        return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950";
      case "Medium":
        return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950";
      case "Low":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950";
      default:
        return "border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <EmployeeHeader />
        <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Welcome, {employee?.name}</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Here's your work overview for today
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Status Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {isPresent ? (
                  <div className="space-y-2">
                    <p className="text-lg md:text-2xl font-bold text-green-600">Logged In</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {new Date(todayAttendance!.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg md:text-2xl font-bold text-gray-600">Not Logged In</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => loginMutation.mutate()}
                    disabled={loginMutation.isPending || isPresent}
                    className="gap-2 w-full text-xs md:text-sm"
                    size="sm"
                    data-testid="button-mark-present"
                  >
                    <LogIn className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{loginMutation.isPending ? "Marking..." : isPresent ? "Already Present" : "Mark Present"}</span>
                    <span className="sm:hidden">{loginMutation.isPending ? "..." : isPresent ? "Present" : "Login"}</span>
                  </Button>
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending || !isPresent || hasLoggedOut}
                    variant="outline"
                    className="gap-2 w-full text-xs md:text-sm"
                    size="sm"
                    data-testid="button-mark-logout"
                  >
                    <LogOutIcon className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{logoutMutation.isPending ? "Logging out..." : hasLoggedOut ? "Logged Out" : "Mark End Time"}</span>
                    <span className="sm:hidden">{logoutMutation.isPending ? "..." : hasLoggedOut ? "Out" : "Logout"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Active Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl md:text-2xl font-bold">{activeTasks.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {activeTasks.length === 1 ? "task pending" : "tasks pending"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl md:text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {completedTasks.length === 1 ? "task completed" : "tasks completed"}
                </p>
              </CardContent>
            </Card>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                <h2 className="text-lg md:text-2xl font-semibold">Important Reminders</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className={getImportanceColor(reminder.importance)}>
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm md:text-lg font-semibold">{reminder.title}</h3>
                            <span className={`inline-block text-xs font-medium px-2 py-1 rounded mt-1 ${
                              reminder.importance === 'High' 
                                ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : reminder.importance === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {reminder.importance}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">{reminder.description}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {reminder.reminderDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg md:text-2xl font-semibold">Your Tasks</h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 md:py-12 text-center text-sm md:text-base text-muted-foreground">
                  <p>No tasks assigned yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} data-testid={`card-task-${task.id}`} className="overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm md:text-base">{task.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <span>Due: {task.dueDate}</span>
                          <span className={`font-medium ${
                            task.priority === 'High' ? 'text-red-600' : 
                            task.priority === 'Medium' ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`font-medium ${
                            task.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
