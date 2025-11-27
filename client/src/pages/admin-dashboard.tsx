import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getCurrentEmployee } from "@/lib/auth";
import type { LeaveRequest, Attendance } from "@shared/schema";

interface StatsData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<StatsData>({
    queryKey: ["/api/attendance/stats"],
    enabled: !!getCurrentEmployee(),
  });

  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
    enabled: !!getCurrentEmployee(),
  });

  const { data: todayAttendance = [] } = useQuery<(Attendance & { name: string })[]>({
    queryKey: ["/api/attendance", `?date=${new Date().toISOString().split('T')[0]}`],
    enabled: !!getCurrentEmployee(),
  });

  const pendingLeaves = leaveRequests.filter(r => r.status === "Pending");

  return (
    <ProtectedRoute adminOnly>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 space-y-4 md:space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
            <p className="text-xs md:text-base text-muted-foreground mt-2">
              Overview of your organization's performance
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg font-medium">Pending Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-xs md:text-base text-muted-foreground">
                    <p>No pending leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {pendingLeaves.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-2 md:p-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-base truncate">{request.employeeId}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {request.startDate} - {request.endDate}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status="Pending" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-base md:text-lg font-medium">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAttendance.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-xs md:text-base text-muted-foreground">
                    <p>No attendance records for today</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {todayAttendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-lg p-2 md:p-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-base truncate">{record.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">{record.employeeId}</p>
                        </div>
                        <p className="text-xs md:text-sm tabular-nums text-muted-foreground flex-shrink-0">
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
