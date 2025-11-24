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
        <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">My Tasks</h1>
            <p className="text-xs md:text-base text-muted-foreground mt-2">
              View and manage your assigned tasks
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-12 md:py-16">
                <div className="text-center text-xs md:text-base text-muted-foreground">
                  <p>Loading tasks...</p>
                </div>
              </CardContent>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 md:py-16">
                <div className="text-center text-muted-foreground">
                  <Clock className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base md:text-lg">No tasks assigned yet</p>
                  <p className="text-xs md:text-sm mt-2">Tasks assigned by your admin will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="hover-elevate flex flex-col" data-testid={`card-task-${task.id}`}>
                  <CardHeader className="pb-3 md:pb-4 flex-shrink-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm md:text-lg font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <Badge 
                        variant={task.priority === "High" ? "destructive" : "secondary"}
                        className="shrink-0 text-xs md:text-sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-3">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-3 md:pt-4 gap-2">
                    <StatusBadge status={task.status as any} />
                    {task.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => completeMutation.mutate(task.id)}
                        disabled={completeMutation.isPending}
                        className="w-full sm:w-auto text-xs md:text-sm"
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
