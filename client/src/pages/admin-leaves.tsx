import { useQuery, useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LeaveRequest } from "@shared/schema";

export default function AdminLeavesPage() {
  const { toast } = useToast();

  const { data: leaveRequests = [], isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/leave-requests/${id}`, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      toast({
        title: `Leave ${status.toLowerCase()}`,
        description: "The employee has been notified",
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

  const handleApprove = (requestId: string) => {
    updateMutation.mutate({ id: requestId, status: "Approved" });
  };

  const handleReject = (requestId: string) => {
    updateMutation.mutate({ id: requestId, status: "Rejected" });
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Leave Management</h1>
            <p className="text-muted-foreground mt-2">
              Review and manage employee leave requests
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Loading leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No leave requests</p>
                  <p className="text-sm mt-2">Leave requests will appear here</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-leave-${request.id}`}>
                          <TableCell className="font-medium">{request.employeeId}</TableCell>
                          <TableCell>{request.startDate}</TableCell>
                          <TableCell>{request.endDate}</TableCell>
                          <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                          <TableCell>{request.appliedDate}</TableCell>
                          <TableCell>
                            <StatusBadge status={request.status as any} />
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === "Pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={updateMutation.isPending}
                                  className="gap-1"
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(request.id)}
                                  disabled={updateMutation.isPending}
                                  className="gap-1"
                                  data-testid={`button-reject-${request.id}`}
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
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
