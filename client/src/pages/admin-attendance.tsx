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
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold">Attendance History</h1>
              <p className="text-xs md:text-base text-muted-foreground mt-2">
                View and export employee attendance records
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="gap-2 text-xs md:text-sm w-full sm:w-auto"
                onClick={() => handleExport("csv")}
                data-testid="button-export-csv"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button
                className="gap-2 text-xs md:text-sm w-full sm:w-auto"
                onClick={() => handleExport("excel")}
                data-testid="button-export-excel"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xs md:text-sm">Employee ID</Label>
                  <Input
                    id="employeeId"
                    placeholder="Filter by ID"
                    value={filters.employeeId}
                    onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                    className="text-xs md:text-sm"
                    data-testid="input-filter-employee"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs md:text-sm">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value, month: "" })}
                    className="text-xs md:text-sm"
                    data-testid="input-filter-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-xs md:text-sm">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={filters.month}
                    onChange={(e) => setFilters({ ...filters, month: e.target.value, date: "" })}
                    className="text-xs md:text-sm"
                    data-testid="input-filter-month"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8 md:py-12 text-xs md:text-base text-muted-foreground">
                  <p>Loading attendance records...</p>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <History className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base md:text-lg">No attendance records</p>
                  <p className="text-xs md:text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs md:text-sm">Employee</TableHead>
                        <TableHead className="text-xs md:text-sm hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-xs md:text-sm hidden md:table-cell">Login Time</TableHead>
                        <TableHead className="text-xs md:text-sm hidden lg:table-cell">Logout Time</TableHead>
                        <TableHead className="text-xs md:text-sm">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id} data-testid={`row-attendance-${record.id}`}>
                          <TableCell className="text-xs md:text-sm font-medium max-w-[120px] truncate">{record.name}</TableCell>
                          <TableCell className="text-xs md:text-sm hidden sm:table-cell">{record.date}</TableCell>
                          <TableCell className="text-xs md:text-sm hidden md:table-cell tabular-nums">{new Date(record.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell className="text-xs md:text-sm hidden lg:table-cell tabular-nums">{record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</TableCell>
                          <TableCell className="text-xs md:text-sm font-medium">{calculateDuration(record.loginTime, record.logoutTime)}</TableCell>
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
