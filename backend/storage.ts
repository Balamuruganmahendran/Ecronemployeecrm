import mongoose from "mongoose";
import type {
  Employee,
  InsertEmployee,
  Attendance,
  InsertAttendance,
  Task,
  InsertTask,
  LeaveRequest,
  InsertLeaveRequest,
  Reminder,
  InsertReminder,
} from "@shared/schema";

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

  getReminder(id: string): Promise<Reminder | undefined>;
  getAllReminders(): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  deleteReminder(id: string): Promise<boolean>;
}

// MongoDB Schemas
const employeeSchema = new mongoose.Schema({
  _id: String,
  employeeId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Employee"], required: true },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  _id: String,
  employeeId: { type: String, required: true },
  date: { type: String, required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date, default: null },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
}, { _id: false });

const leaveRequestSchema = new mongoose.Schema({
  _id: String,
  employeeId: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  appliedDate: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, required: true },
  description: { type: String, required: true },
  reminderDate: { type: String, required: true },
  importance: { type: String, enum: ["Low", "Medium", "High"], required: true },
  createdAt: { type: String, required: true },
}, { _id: false });

const EmployeeModel = mongoose.model("Employee", employeeSchema);
const AttendanceModel = mongoose.model("Attendance", attendanceSchema);
const TaskModel = mongoose.model("Task", taskSchema);
const LeaveRequestModel = mongoose.model("LeaveRequest", leaveRequestSchema);
const ReminderModel = mongoose.model("Reminder", reminderSchema);

export class MongoStorage implements IStorage {
  async getEmployee(id: string): Promise<Employee | undefined> {
    const doc = await EmployeeModel.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const doc = await EmployeeModel.findOne({ employeeId }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    const docs = await EmployeeModel.find({}).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = new mongoose.Types.ObjectId().toString();
    const doc = await EmployeeModel.create({ _id: id, ...insertEmployee });
    return { ...doc.toObject(), id: doc._id };
  }

  async updateEmployee(id: string, update: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const doc = await EmployeeModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await EmployeeModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async getAttendance(id: string): Promise<Attendance | undefined> {
    const doc = await AttendanceModel.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getAttendanceByEmployeeId(employeeId: string): Promise<Attendance[]> {
    const docs = await AttendanceModel.find({ employeeId }).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    const docs = await AttendanceModel.find({ date }).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getAttendanceByMonth(month: string): Promise<Attendance[]> {
    const docs = await AttendanceModel.find({ date: { $regex: `^${month}` } }).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getTodayAttendance(employeeId: string): Promise<Attendance | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const doc = await AttendanceModel.findOne({ employeeId, date: today }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = new mongoose.Types.ObjectId().toString();
    const doc = await AttendanceModel.create({ _id: id, ...insertAttendance });
    return { ...doc.toObject(), id: doc._id };
  }

  async updateAttendance(id: string, update: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const doc = await AttendanceModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    const docs = await AttendanceModel.find({}).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const doc = await TaskModel.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getTasksByEmployee(employeeId: string): Promise<Task[]> {
    const docs = await TaskModel.find({ assignedTo: employeeId }).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getAllTasks(): Promise<Task[]> {
    const docs = await TaskModel.find({}).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = new mongoose.Types.ObjectId().toString();
    const doc = await TaskModel.create({ _id: id, ...insertTask });
    return { ...doc.toObject(), id: doc._id };
  }

  async updateTask(id: string, update: Partial<InsertTask>): Promise<Task | undefined> {
    const doc = await TaskModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const doc = await LeaveRequestModel.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const docs = await LeaveRequestModel.find({ employeeId }).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    const docs = await LeaveRequestModel.find({}).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async createLeaveRequest(insertRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const id = new mongoose.Types.ObjectId().toString();
    const doc = await LeaveRequestModel.create({ _id: id, ...insertRequest });
    return { ...doc.toObject(), id: doc._id };
  }

  async updateLeaveRequest(id: string, update: Partial<InsertLeaveRequest>): Promise<LeaveRequest | undefined> {
    const doc = await LeaveRequestModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    const doc = await ReminderModel.findById(id).lean();
    return doc ? { ...doc, id: doc._id } : undefined;
  }

  async getAllReminders(): Promise<Reminder[]> {
    const docs = await ReminderModel.find({}).lean();
    return docs.map(doc => ({ ...doc, id: doc._id }));
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = new mongoose.Types.ObjectId().toString();
    const doc = await ReminderModel.create({ _id: id, ...insertReminder });
    return { ...doc.toObject(), id: doc._id };
  }

  async deleteReminder(id: string): Promise<boolean> {
    const result = await ReminderModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export let storage: IStorage;

export async function initializeStorage() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }
  
  await mongoose.connect(mongoUri);
  storage = new MongoStorage();
  console.log("✅ Connected to MongoDB");
}
