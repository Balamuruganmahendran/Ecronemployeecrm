import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface AnalyticsData {
  monthlyAttendance: { month: string; count: number }[];
  taskCompletion: { total: number; completed: number; rate: number };
  leaveRequests: { pending: number; approved: number; rejected: number };
}

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Visualize attendance trends and task completion rates
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <p>Loading analytics...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-monthly-attendance">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Monthly Attendance</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video">
                  {analytics?.monthlyAttendance && analytics.monthlyAttendance.length > 0 ? (
                    <div className="h-full flex flex-col justify-end gap-2">
                      {analytics.monthlyAttendance.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="text-xs w-20 text-muted-foreground">{item.month}</span>
                          <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                            <div 
                              className="bg-primary h-full flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium"
                              style={{ 
                                width: `${Math.max((item.count / Math.max(...analytics.monthlyAttendance.map(m => m.count))) * 100, 5)}%` 
                              }}
                            >
                              {item.count > 0 && item.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No attendance data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-task-completion">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Task Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video flex items-center justify-center">
                  {analytics?.taskCompletion && analytics.taskCompletion.total > 0 ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-40 h-40 mx-auto">
                        <svg className="transform -rotate-90 w-40 h-40">
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-muted"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - analytics.taskCompletion.rate / 100)}`}
                            className="text-primary"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold">{analytics.taskCompletion.rate}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {analytics.taskCompletion.completed} of {analytics.taskCompletion.total} tasks completed
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No task data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-leave-analytics">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Leave Request Analytics</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video flex items-center justify-center">
                  {analytics?.leaveRequests && (analytics.leaveRequests.pending + analytics.leaveRequests.approved + analytics.leaveRequests.rejected) > 0 ? (
                    <div className="space-y-4 w-full max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pending</span>
                          <span className="text-sm font-medium">{analytics.leaveRequests.pending}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500"
                            style={{ 
                              width: `${(analytics.leaveRequests.pending / (analytics.leaveRequests.pending + analytics.leaveRequests.approved + analytics.leaveRequests.rejected)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Approved</span>
                          <span className="text-sm font-medium">{analytics.leaveRequests.approved}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ 
                              width: `${(analytics.leaveRequests.approved / (analytics.leaveRequests.pending + analytics.leaveRequests.approved + analytics.leaveRequests.rejected)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rejected</span>
                          <span className="text-sm font-medium">{analytics.leaveRequests.rejected}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500"
                            style={{ 
                              width: `${(analytics.leaveRequests.rejected / (analytics.leaveRequests.pending + analytics.leaveRequests.approved + analytics.leaveRequests.rejected)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No leave request data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video flex items-center justify-center">
                  {analytics ? (
                    <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                      <div className="text-center space-y-2">
                        <p className="text-3xl font-bold tabular-nums">
                          {analytics.monthlyAttendance.reduce((sum, item) => sum + item.count, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Attendance</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-3xl font-bold tabular-nums">
                          {analytics.taskCompletion.total}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-3xl font-bold tabular-nums">
                          {analytics.leaveRequests.pending + analytics.leaveRequests.approved + analytics.leaveRequests.rejected}
                        </p>
                        <p className="text-sm text-muted-foreground">Leave Requests</p>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-3xl font-bold tabular-nums">
                          {analytics.taskCompletion.rate}%
                        </p>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Loading stats...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
