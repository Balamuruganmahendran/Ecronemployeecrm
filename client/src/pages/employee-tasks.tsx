import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { Clock, CheckCircle2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function EmployeeTasksPage() {
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => 
      apiRequest("PATCH", `/api/tasks/${taskId}`, { status: "Completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task marked as completed",
        description: "The admin will be notified",
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <EmployeeHeader />
        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">My Tasks</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your assigned tasks
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <p>Loading tasks...</p>
                </div>
              </CardContent>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No tasks assigned yet</p>
                  <p className="text-sm mt-2">Tasks assigned by your admin will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover-elevate" data-testid={`card-task-${task.id}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <Badge 
                        variant={task.priority === "High" ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t pt-4">
                    <StatusBadge status={task.status as any} />
                    {task.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => completeMutation.mutate(task.id)}
                        disabled={completeMutation.isPending}
                        data-testid={`button-complete-${task.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {completeMutation.isPending ? "Marking..." : "Complete"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
