import { Employee } from "@shared/schema";

const AUTH_KEY = "employee_lms_auth";

export interface AuthData {
  employee: Employee;
  token: string;
}

export function setAuthData(data: AuthData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuthData(): AuthData | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearAuthData() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  const auth = getAuthData();
  return auth?.employee.role === "Admin";
}

export function getCurrentEmployee(): Employee | null {
  const auth = getAuthData();
  return auth?.employee || null;
}
