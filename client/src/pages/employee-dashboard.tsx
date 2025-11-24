import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle, Bell, Calendar } from "lucide-react";
import { getCurrentEmployee } from "@/lib/auth";
import type { Attendance, Task, Reminder } from "@shared/schema";

interface AttendanceWithName extends Attendance {
  name: string;
}

export default function EmployeeDashboard() {
  const [, setLocation] = useLocation();
  const employee = getCurrentEmployee();

  const { data: todayAttendance } = useQuery<AttendanceWithName>({
    queryKey: ["/api/attendance/today"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const activeTasks = tasks.filter(t => t.status === "Pending");
  const completedTasks = tasks.filter(t => t.status === "Completed");

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
        <main className="max-w-7xl mx-auto p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Welcome, {employee?.name}</h1>
            <p className="text-muted-foreground mt-2">
              Here's your work overview for today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {todayAttendance ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-green-600">Logged In</p>
                    <p className="text-xs text-muted-foreground">
                      Logged in at {new Date(todayAttendance.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-600">Not Logged In</p>
                    <Button
                      size="sm"
                      onClick={() => setLocation("/employee/dashboard")}
                      data-testid="button-login"
                    >
                      Mark Attendance
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activeTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {activeTasks.length === 1 ? "task pending" : "tasks pending"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  {completedTasks.length === 1 ? "task completed" : "tasks completed"}
                </p>
              </CardContent>
            </Card>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="text-2xl font-semibold">Important Reminders</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className={getImportanceColor(reminder.importance)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{reminder.title}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              reminder.importance === 'High' 
                                ? 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : reminder.importance === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {reminder.importance}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{reminder.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {reminder.reminderDate}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Tasks</h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No tasks assigned yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} data-testid={`card-task-${task.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                            <span>Due: {task.dueDate}</span>
                            <span className={`font-medium ${
                              task.priority === 'High' ? 'text-red-600' : 
                              task.priority === 'Medium' ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {task.priority} Priority
                            </span>
                            <span className={`font-medium ${
                              task.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {task.status}
                            </span>
                          </div>
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
