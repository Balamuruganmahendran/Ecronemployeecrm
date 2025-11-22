import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LeaveRequest } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EmployeeLeavePage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const { data: leaveRequests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/leave-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: "Leave request submitted",
        description: "Your request has been sent for approval",
      });
      setIsDialogOpen(false);
      setFormData({ startDate: "", endDate: "", reason: "" });
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <EmployeeHeader />
        <main className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Leave Requests</h1>
              <p className="text-muted-foreground mt-2">
                Apply for leave and track your requests
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-apply-leave">
                  <Plus className="w-4 h-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your leave request
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        data-testid="input-start-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                        data-testid="input-end-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason for leave..."
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        required
                        rows={4}
                        data-testid="input-reason"
                      />
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
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending} 
                      data-testid="button-submit-leave"
                    >
                      {createMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <p>Loading leave requests...</p>
                </div>
              </CardContent>
            </Card>
          ) : leaveRequests.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No leave requests yet</p>
                  <p className="text-sm mt-2">Click "Apply for Leave" to submit a new request</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <Card key={request.id} data-testid={`card-leave-${request.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {request.startDate} - {request.endDate}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Applied on {request.appliedDate}
                        </p>
                      </div>
                      <StatusBadge status={request.status as any} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
