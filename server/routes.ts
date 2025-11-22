import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertEmployeeSchema, insertTaskSchema, insertLeaveRequestSchema } from "@shared/schema";
import * as XLSX from "xlsx";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  employee?: {
    id: string;
    employeeId: string;
    name: string;
    role: string;
  };
}

// Middleware: Verify JWT token
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const employee = await storage.getEmployee(decoded.id);
    
    if (!employee) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.employee = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      role: employee.role,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware: Require admin role
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.employee?.role !== "Admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== AUTHENTICATION ====================
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { employeeId, password } = req.body;
      
      const employee = await storage.getEmployeeByEmployeeId(employeeId);
      if (!employee) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, employee.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: employee.id, employeeId: employee.employeeId, role: employee.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { password: _, ...employeeWithoutPassword } = employee;
      res.json({ employee: employeeWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    const employee = await storage.getEmployee(req.employee!.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const { password: _, ...employeeWithoutPassword } = employee;
    res.json(employeeWithoutPassword);
  });

  // ==================== EMPLOYEES (ADMIN ONLY) ====================
  
  app.get("/api/employees", authenticate, requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const employeesWithoutPasswords = employees.map(({ password, ...emp }) => emp);
      res.json(employeesWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", authenticate, requireAdmin, async (req, res) => {
    try {
      const data = insertEmployeeSchema.parse(req.body);
      
      const existing = await storage.getEmployeeByEmployeeId(data.employeeId);
      if (existing) {
        return res.status(400).json({ error: "Employee ID already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const employee = await storage.createEmployee({
        ...data,
        password: hashedPassword,
      });

      const { password: _, ...employeeWithoutPassword } = employee;
      res.status(201).json(employeeWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const employee = await storage.updateEmployee(id, data);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const { password: _, ...employeeWithoutPassword } = employee;
      res.json(employeeWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmployee(id);
      
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // ==================== ATTENDANCE ====================
  
  app.post("/api/attendance/login", authenticate, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await storage.getTodayAttendance(req.employee!.employeeId);
      
      if (existing) {
        return res.status(400).json({ error: "Already marked present today" });
      }

      const attendance = await storage.createAttendance({
        employeeId: req.employee!.employeeId,
        loginTime: new Date(),
        logoutTime: null,
        date: today,
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark attendance" });
    }
  });

  app.post("/api/attendance/logout", authenticate, async (req: AuthRequest, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendance = await storage.getTodayAttendance(req.employee!.employeeId);
      
      if (!attendance) {
        return res.status(400).json({ error: "No login record found for today" });
      }

      if (attendance.logoutTime) {
        return res.status(400).json({ error: "Already logged out" });
      }

      const updated = await storage.updateAttendance(attendance.id, {
        logoutTime: new Date(),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark logout" });
    }
  });

  app.get("/api/attendance/today", authenticate, async (req: AuthRequest, res) => {
    try {
      const attendance = await storage.getTodayAttendance(req.employee!.employeeId);
      res.json(attendance || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance", authenticate, requireAdmin, async (req, res) => {
    try {
      const { employeeId, date, month } = req.query;
      
      let records;
      if (month) {
        records = await storage.getAttendanceByMonth(month as string);
      } else if (date) {
        records = await storage.getAttendanceByDate(date as string);
      } else if (employeeId) {
        records = await storage.getAttendanceByEmployeeId(employeeId as string);
      } else {
        records = await storage.getAllAttendance();
      }

      // Enrich with employee names
      const enriched = await Promise.all(
        records.map(async (record) => {
          const employee = await storage.getEmployeeByEmployeeId(record.employeeId);
          return {
            ...record,
            name: employee?.name || "Unknown",
          };
        })
      );

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.get("/api/attendance/stats", authenticate, requireAdmin, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = await storage.getAttendanceByDate(today);
      const allEmployees = await storage.getAllEmployees();

      const stats = {
        totalEmployees: allEmployees.length,
        presentToday: todayRecords.length,
        absentToday: allEmployees.length - todayRecords.length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/attendance/export/csv", authenticate, requireAdmin, async (req, res) => {
    try {
      const { month } = req.query;
      const records = month 
        ? await storage.getAttendanceByMonth(month as string)
        : await storage.getAllAttendance();

      const enriched = await Promise.all(
        records.map(async (record) => {
          const employee = await storage.getEmployeeByEmployeeId(record.employeeId);
          return {
            "Employee ID": record.employeeId,
            "Name": employee?.name || "Unknown",
            "Date": record.date,
            "Login Time": record.loginTime ? new Date(record.loginTime).toLocaleTimeString() : "",
            "Logout Time": record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : "",
          };
        })
      );

      const csv = [
        Object.keys(enriched[0] || {}).join(","),
        ...enriched.map(row => Object.values(row).join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  app.get("/api/attendance/export/excel", authenticate, requireAdmin, async (req, res) => {
    try {
      const { month } = req.query;
      const records = month 
        ? await storage.getAttendanceByMonth(month as string)
        : await storage.getAllAttendance();

      const enriched = await Promise.all(
        records.map(async (record) => {
          const employee = await storage.getEmployeeByEmployeeId(record.employeeId);
          return {
            "Employee ID": record.employeeId,
            "Name": employee?.name || "Unknown",
            "Date": record.date,
            "Login Time": record.loginTime ? new Date(record.loginTime).toLocaleTimeString() : "",
            "Logout Time": record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : "",
          };
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(enriched);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to export Excel" });
    }
  });

  app.get("/api/attendance/working-days", authenticate, async (req: AuthRequest, res) => {
    try {
      const records = await storage.getAttendanceByEmployeeId(req.employee!.employeeId);
      res.json({ workingDays: records.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch working days" });
    }
  });

  // ==================== TASKS ====================
  
  app.get("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const tasks = req.employee!.role === "Admin"
        ? await storage.getAllTasks()
        : await storage.getTasksByEmployee(req.employee!.employeeId);
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", authenticate, requireAdmin, async (req, res) => {
    try {
      const data = insertTaskSchema.parse({
        ...req.body,
        assignedDate: new Date().toISOString().split('T')[0],
        status: "Pending",
      });

      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (req.employee!.role !== "Admin" && task.assignedTo !== req.employee!.employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updated = await storage.updateTask(id, { status });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  // ==================== LEAVE REQUESTS ====================
  
  app.get("/api/leave-requests", authenticate, async (req: AuthRequest, res) => {
    try {
      const requests = req.employee!.role === "Admin"
        ? await storage.getAllLeaveRequests()
        : await storage.getLeaveRequestsByEmployee(req.employee!.employeeId);
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertLeaveRequestSchema.parse({
        ...req.body,
        employeeId: req.employee!.employeeId,
        status: "Pending",
        appliedDate: new Date().toISOString().split('T')[0],
      });

      const request = await storage.createLeaveRequest(data);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create leave request" });
    }
  });

  app.patch("/api/leave-requests/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updated = await storage.updateLeaveRequest(id, { status });
      if (!updated) {
        return res.status(404).json({ error: "Leave request not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update leave request" });
    }
  });

  // ==================== ANALYTICS (ADMIN ONLY) ====================
  
  app.get("/api/analytics", authenticate, requireAdmin, async (req, res) => {
    try {
      const allAttendance = await storage.getAllAttendance();
      const allTasks = await storage.getAllTasks();
      const allLeaveRequests = await storage.getAllLeaveRequests();

      // Monthly attendance data (last 6 months)
      const monthlyAttendance = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toISOString().slice(0, 7);
        const count = allAttendance.filter(att => att.date.startsWith(month)).length;
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count,
        };
      }).reverse();

      // Task completion rate
      const completedTasks = allTasks.filter(t => t.status === "Completed").length;
      const taskCompletionRate = allTasks.length > 0 
        ? Math.round((completedTasks / allTasks.length) * 100)
        : 0;

      // Leave request analytics
      const pendingLeaves = allLeaveRequests.filter(r => r.status === "Pending").length;
      const approvedLeaves = allLeaveRequests.filter(r => r.status === "Approved").length;
      const rejectedLeaves = allLeaveRequests.filter(r => r.status === "Rejected").length;

      res.json({
        monthlyAttendance,
        taskCompletion: {
          total: allTasks.length,
          completed: completedTasks,
          rate: taskCompletionRate,
        },
        leaveRequests: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
