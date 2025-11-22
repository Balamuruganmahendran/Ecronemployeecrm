import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { Plus, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

export default function AdminTasksPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
  });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task assigned",
        description: "The task has been assigned to the employee",
      });
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "Medium",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Task Management</h1>
              <p className="text-muted-foreground mt-2">
                Assign and track tasks for employees
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-assign-task">
                  <Plus className="w-4 h-4" />
                  Assign Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                  <DialogDescription>
                    Create and assign a task to an employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        placeholder="Complete quarterly report"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        data-testid="input-title"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed task description..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        data-testid="input-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assign To (Employee ID)</Label>
                      <Input
                        id="assignedTo"
                        placeholder="EMP001"
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        required
                        data-testid="input-assigned-to"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        data-testid="input-due-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                      {createMutation.isPending ? "Assigning..." : "Assign Task"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No tasks assigned yet</p>
                  <p className="text-sm mt-2">Click "Assign Task" to create your first task</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.assignedTo}</TableCell>
                          <TableCell>{task.dueDate}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              task.priority === 'High' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={task.status as any} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
