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
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Leave Management</h1>
            <p className="text-xs md:text-base text-muted-foreground mt-2">
              Review and manage employee leave requests
            </p>
          </div>

          <Card>
            <CardContent className="p-4 md:p-6">
              {isLoading ? (
                <div className="text-center py-8 md:py-12 text-sm md:text-base text-muted-foreground">
                  <p>Loading leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base md:text-lg">No leave requests</p>
                  <p className="text-xs md:text-sm mt-2">Leave requests will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs md:text-sm">Employee ID</TableHead>
                        <TableHead className="text-xs md:text-sm hidden sm:table-cell">Duration</TableHead>
                        <TableHead className="text-xs md:text-sm hidden md:table-cell">Reason</TableHead>
                        <TableHead className="text-xs md:text-sm hidden lg:table-cell">Applied On</TableHead>
                        <TableHead className="text-xs md:text-sm">Status</TableHead>
                        <TableHead className="text-xs md:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request) => (
                        <TableRow key={request.id} data-testid={`row-leave-${request.id}`}>
                          <TableCell className="font-medium text-xs md:text-sm">{request.employeeId}</TableCell>
                          <TableCell className="text-xs md:text-sm hidden sm:table-cell">
                            <span className="truncate">{request.startDate} - {request.endDate}</span>
                          </TableCell>
                          <TableCell className="text-xs md:text-sm hidden md:table-cell max-w-[150px] truncate">{request.reason}</TableCell>
                          <TableCell className="text-xs md:text-sm hidden lg:table-cell">{request.appliedDate}</TableCell>
                          <TableCell>
                            <StatusBadge status={request.status as any} />
                          </TableCell>
                          <TableCell>
                            {request.status === "Pending" && (
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={updateMutation.isPending}
                                  className="gap-1 text-xs md:text-sm h-8 md:h-9"
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span className="hidden sm:inline">Approve</span>
                                  <span className="sm:hidden">✓</span>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(request.id)}
                                  disabled={updateMutation.isPending}
                                  className="gap-1 text-xs md:text-sm h-8 md:h-9"
                                  data-testid={`button-reject-${request.id}`}
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span className="hidden sm:inline">Reject</span>
                                  <span className="sm:hidden">✕</span>
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
