import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, History, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Attendance } from "@shared/schema";

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    employeeId: "",
    date: "",
    month: "",
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append("employeeId", filters.employeeId);
    if (filters.month) params.append("month", filters.month);
    else if (filters.date) params.append("date", filters.date);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const { data: attendanceRecords = [], isLoading } = useQuery<(Attendance & { name: string })[]>({
    queryKey: ["/api/attendance", buildQueryString()],
  });

  const handleExport = (format: "csv" | "excel") => {
    const monthParam = filters.month ? `?month=${filters.month}` : "";
    const url = `/api/attendance/export/${format}${monthParam}`;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance.${format === "csv" ? "csv" : "xlsx"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: `Exporting to ${format.toUpperCase()}`,
      description: "Your file will download shortly",
    });
  };

  const calculateDuration = (loginTime: Date | string, logoutTime: Date | string | null) => {
    if (!logoutTime) return "N/A";
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diff = logout.getTime() - login.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Attendance History</h1>
              <p className="text-muted-foreground mt-2">
                View and export employee attendance records
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleExport("csv")}
                data-testid="button-export-csv"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                className="gap-2"
                onClick={() => handleExport("excel")}
                data-testid="button-export-excel"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="filterEmployeeId">Employee ID</Label>
                  <Input
                    id="filterEmployeeId"
                    placeholder="EMP001"
                    value={filters.employeeId}
                    onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                    data-testid="input-filter-employee-id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterDate">Date</Label>
                  <Input
                    id="filterDate"
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value, month: "" })}
                    data-testid="input-filter-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filterMonth">Month</Label>
                  <Input
                    id="filterMonth"
                    type="month"
                    value={filters.month}
                    onChange={(e) => setFilters({ ...filters, month: e.target.value, date: "" })}
                    data-testid="input-filter-month"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Loading attendance records...</p>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No attendance records</p>
                  <p className="text-sm mt-2">
                    {filters.employeeId || filters.date || filters.month 
                      ? "Try adjusting your filters" 
                      : "Attendance records will appear here"}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Login Time</TableHead>
                        <TableHead>Logout Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id} data-testid={`row-attendance-${record.id}`}>
                          <TableCell className="font-medium">{record.employeeId}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell className="tabular-nums">
                            {new Date(record.loginTime).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {record.logoutTime
                              ? new Date(record.logoutTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : "--:--"}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {calculateDuration(record.loginTime, record.logoutTime)}
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
