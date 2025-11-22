import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull(),
  loginTime: timestamp("login_time").notNull(),
  logoutTime: timestamp("logout_time"),
  date: text("date").notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  assignedTo: text("assigned_to").notNull(),
  assignedDate: text("assigned_date").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Pending"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("Pending"),
  appliedDate: text("applied_date").notNull(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
