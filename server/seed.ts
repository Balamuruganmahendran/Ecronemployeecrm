import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  // Check if admin already exists
  const existingAdmin = await storage.getEmployeeByEmployeeId("ADMIN");
  
  if (!existingAdmin) {
    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createEmployee({
      employeeId: "ADMIN",
      name: "System Administrator",
      password: hashedPassword,
      role: "Admin",
    });
    console.log("✅ Default admin created (ID: ADMIN, Password: admin123)");
  }

  // Create sample employee for testing
  const existingEmployee = await storage.getEmployeeByEmployeeId("EMP001");
  
  if (!existingEmployee) {
    const hashedPassword = await bcrypt.hash("emp123", 10);
    await storage.createEmployee({
      employeeId: "EMP001",
      name: "John Doe",
      password: hashedPassword,
      role: "Employee",
    });
    console.log("✅ Sample employee created (ID: EMP001, Password: emp123)");
  }
}
