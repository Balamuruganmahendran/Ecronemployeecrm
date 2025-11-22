import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import type { LeaveRequest, Attendance } from "@shared/schema";

interface StatsData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/attendance/stats"],
  });

  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  const { data: todayAttendance = [] } = useQuery<(Attendance & { name: string })[]>({
    queryKey: ["/api/attendance", `?date=${new Date().toISOString().split('T')[0]}`],
  });

  const pendingLeaves = leaveRequests.filter(r => r.status === "Pending");

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Overview of your organization's performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Employees"
              value={stats?.totalEmployees || 0}
              icon={Users}
            />
            <StatCard
              label="Present Today"
              value={stats?.presentToday || 0}
              icon={UserCheck}
            />
            <StatCard
              label="Absent Today"
              value={stats?.absentToday || 0}
              icon={UserX}
            />
            <StatCard
              label="Pending Leaves"
              value={pendingLeaves.length}
              icon={Calendar}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Pending Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No pending leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingLeaves.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex-1">
                          <p className="font-medium">{request.employeeId}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.startDate} - {request.endDate}
                          </p>
                        </div>
                        <StatusBadge status="Pending" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAttendance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No attendance records for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAttendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex-1">
                          <p className="font-medium">{record.name}</p>
                          <p className="text-sm text-muted-foreground">{record.employeeId}</p>
                        </div>
                        <p className="text-sm tabular-nums text-muted-foreground">
                          {new Date(record.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
