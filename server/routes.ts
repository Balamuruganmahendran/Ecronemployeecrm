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
        { expiresIn: "7d" }
      );

      res.json({
        token,
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          role: employee.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== EMPLOYEES ====================
  
  app.get("/api/employees", authenticate, requireAdmin, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      const safeEmployees = employees.map(emp => ({
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        role: emp.role,
      }));
      res.json(safeEmployees);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employees", authenticate, requireAdmin, async (req, res) => {
    try {
      const validation = insertEmployeeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const existingEmployee = await storage.getEmployeeByEmployeeId(req.body.employeeId);
      if (existingEmployee) {
        return res.status(400).json({ error: "Employee ID already exists" });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const employee = await storage.createEmployee({
        ...req.body,
        password: hashedPassword,
      });

      res.status(201).json({
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employees/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const updateData: any = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.role) updateData.role = req.body.role;
      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 10);
      }

      const updated = await storage.updateEmployee(req.params.id, updateData);
      res.json({
        id: updated!.id,
        employeeId: updated!.employeeId,
        name: updated!.name,
        role: updated!.role,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employees/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      await storage.deleteEmployee(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== TASKS ====================
  
  app.get("/api/tasks", authenticate, async (req, res) => {
    try {
      if (req.employee?.role === "Admin") {
        const tasks = await storage.getAllTasks();
        res.json(tasks);
      } else {
        const tasks = await storage.getTasksByEmployee(req.employee!.employeeId);
        res.json(tasks);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks", authenticate, requireAdmin, async (req, res) => {
    try {
      const validation = insertTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const task = await storage.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/tasks/:id", authenticate, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (req.employee?.role !== "Admin" && task.assignedTo !== req.employee?.employeeId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updated = await storage.updateTask(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== ATTENDANCE ====================
  
  app.post("/api/attendance/login", authenticate, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await storage.getTodayAttendance(req.employee!.employeeId);
      
      if (todayAttendance) {
        return res.status(400).json({ error: "Already logged in today" });
      }

      const attendance = await storage.createAttendance({
        employeeId: req.employee!.employeeId,
        date: today,
        loginTime: new Date(),
        logoutTime: null,
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/attendance/logout", authenticate, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await storage.getTodayAttendance(req.employee!.employeeId);
      
      if (!todayAttendance) {
        return res.status(404).json({ error: "No login record found for today" });
      }

      const updated = await storage.updateAttendance(todayAttendance.id, {
        logoutTime: new Date(),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attendance", authenticate, async (req, res) => {
    try {
      const { employeeId, date, month } = req.query;

      let records = await storage.getAllAttendance();

      if (date) {
        records = await storage.getAttendanceByDate(date as string);
      } else if (month) {
        records = await storage.getAttendanceByMonth(month as string);
      } else if (employeeId) {
        records = await storage.getAttendanceByEmployeeId(employeeId as string);
      }

      // Add employee names
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          const employee = await storage.getEmployeeByEmployeeId(record.employeeId);
          return {
            ...record,
            name: employee?.name || "Unknown",
          };
        })
      );

      res.json(enrichedRecords);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attendance/stats", authenticate, requireAdmin, async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = await storage.getAttendanceByDate(today);
      const employees = await storage.getAllEmployees();
      const presentEmployees = new Set(todayRecords.map(r => r.employeeId));

      res.json({
        totalEmployees: employees.length,
        presentToday: presentEmployees.size,
        absentToday: employees.length - presentEmployees.size,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attendance/export/:format", authenticate, requireAdmin, async (req, res) => {
    try {
      const { format } = req.params;
      const { month } = req.query;

      let records = await storage.getAllAttendance();
      if (month) {
        records = await storage.getAttendanceByMonth(month as string);
      }

      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          const employee = await storage.getEmployeeByEmployeeId(record.employeeId);
          return {
            EmployeeID: record.employeeId,
            Name: employee?.name || "Unknown",
            Date: record.date,
            LoginTime: new Date(record.loginTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            LogoutTime: record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
          };
        })
      );

      if (format === "csv") {
        const csv = [
          Object.keys(enrichedRecords[0] || {}).join(","),
          ...enrichedRecords.map(r => Object.values(r).join(",")),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="attendance-${month || new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
      } else if (format === "excel") {
        const ws = XLSX.utils.json_to_sheet(enrichedRecords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        
        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="attendance-${month || new Date().toISOString().split('T')[0]}.xlsx"`);
        res.send(buffer);
      } else {
        res.status(400).json({ error: "Invalid format" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== LEAVE REQUESTS ====================
  
  app.get("/api/leave-requests", authenticate, async (req, res) => {
    try {
      if (req.employee?.role === "Admin") {
        const requests = await storage.getAllLeaveRequests();
        res.json(requests);
      } else {
        const requests = await storage.getLeaveRequestsByEmployee(req.employee!.employeeId);
        res.json(requests);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/leave-requests", authenticate, async (req, res) => {
    try {
      const validation = insertLeaveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const request = await storage.createLeaveRequest({
        ...req.body,
        employeeId: req.employee!.employeeId,
      });

      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/leave-requests/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const request = await storage.getLeaveRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Leave request not found" });
      }

      const updated = await storage.updateLeaveRequest(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== ANALYTICS ====================
  
  app.get("/api/analytics", authenticate, requireAdmin, async (req, res) => {
    try {
      const allRecords = await storage.getAllAttendance();
      const allTasks = await storage.getAllTasks();
      const allLeaveRequests = await storage.getAllLeaveRequests();

      // Monthly attendance
      const monthlyMap: { [key: string]: number } = {};
      allRecords.forEach(r => {
        const month = r.date.substring(0, 7);
        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      });
      const monthlyAttendance = Object.entries(monthlyMap)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Task completion
      const completedTasks = allTasks.filter(t => t.status === "Completed").length;
      const taskCompletion = {
        total: allTasks.length,
        completed: completedTasks,
        rate: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
      };

      // Leave analytics
      const leaveRequests = {
        pending: allLeaveRequests.filter(r => r.status === "Pending").length,
        approved: allLeaveRequests.filter(r => r.status === "Approved").length,
        rejected: allLeaveRequests.filter(r => r.status === "Rejected").length,
      };

      res.json({
        monthlyAttendance,
        taskCompletion,
        leaveRequests,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== REMINDERS ====================
  
  app.get("/api/reminders", authenticate, async (req, res) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/reminders", authenticate, requireAdmin, async (req, res) => {
    try {
      const { title, description, reminderDate, importance } = req.body;
      
      if (!title || !description || !reminderDate || !importance) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const reminder = await storage.createReminder({
        title,
        description,
        reminderDate,
        importance,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/reminders/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const reminder = await storage.getReminder(req.params.id);
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }

      await storage.deleteReminder(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return createServer(app);
}
