import {
  type Employee,
  type InsertEmployee,
  type Attendance,
  type InsertAttendance,
  type Task,
  type InsertTask,
  type LeaveRequest,
  type InsertLeaveRequest,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByEmployeeId(employeeId: string): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAttendanceByMonth(month: string): Promise<Attendance[]>;
  getTodayAttendance(employeeId: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  getAllAttendance(): Promise<Attendance[]>;

  getTask(id: string): Promise<Task | undefined>;
  getTasksByEmployee(employeeId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;

  getLeaveRequest(id: string): Promise<LeaveRequest | undefined>;
  getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]>;
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: string, request: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private attendance: Map<string, Attendance>;
  private tasks: Map<string, Task>;
  private leaveRequests: Map<string, LeaveRequest>;

  constructor() {
    this.employees = new Map();
    this.attendance = new Map();
    this.tasks = new Map();
    this.leaveRequests = new Map();
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      (emp) => emp.employeeId === employeeId,
    );
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { ...insertEmployee, id };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, update: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updated = { ...employee, ...update };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async getAttendanceByEmployeeId(employeeId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (att) => att.employeeId === employeeId,
    );
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (att) => att.date === date,
    );
  }

  async getAttendanceByMonth(month: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (att) => att.date.startsWith(month),
    );
  }

  async getTodayAttendance(employeeId: string): Promise<Attendance | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.attendance.values()).find(
      (att) => att.employeeId === employeeId && att.date === today,
    );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { ...insertAttendance, id };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, update: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updated = { ...attendance, ...update };
    this.attendance.set(id, updated);
    return updated;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return Array.from(this.attendance.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByEmployee(employeeId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === employeeId,
    );
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, update: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated = { ...task, ...update };
    this.tasks.set(id, updated);
    return updated;
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    return this.leaveRequests.get(id);
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values()).filter(
      (req) => req.employeeId === employeeId,
    );
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values());
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = randomUUID();
    const request: LeaveRequest = { ...insertRequest, id };
    this.leaveRequests.set(id, request);
    return request;
  }

  async updateLeaveRequest(id: string, update: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined> {
    const request = this.leaveRequests.get(id);
    if (!request) return undefined;
    
    const updated = { ...request, ...update };
    this.leaveRequests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
