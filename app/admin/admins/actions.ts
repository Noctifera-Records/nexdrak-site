"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface AdminProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at?: string;
}

async function checkAdminAuth() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: You must be an admin to perform this action");
  }
  return session;
}

export async function getAdmins(): Promise<AdminProfile[]> {
  await checkAdminAuth();

  // Use Better Auth admin API to list users with admin role
  const result = await auth.api.listUsers({
    query: {
      filterField: "role",
      filterValue: "admin",
      filterOperator: "eq",
      limit: 100,
    },
    headers: await headers(),
  });

  const users = result.users || [];

  return users.map((user: any) => ({
    id: user.id,
    email: user.email || "N/A",
    name: user.name || undefined,
    role: user.role || "admin",
    created_at: user.createdAt,
  }));
}

export async function createAdmin(email: string, password: string): Promise<AdminProfile> {
  await checkAdminAuth();

  if (!email?.trim() || !password?.trim()) {
    throw new Error("Email and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Use Better Auth admin API to create user
  const newUser = await auth.api.createUser({
    body: {
      email: email.trim(),
      password: password,
      name: email.split("@")[0],
      role: "admin",
    },
  });

  if (!newUser) {
    throw new Error("Error creating administrator user");
  }

  revalidatePath("/admin/admins");

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name || undefined,
    role: "admin",
    created_at: newUser.createdAt?.toString(),
  };
}

export async function deleteAdmin(adminId: string): Promise<boolean> {
  const session = await checkAdminAuth();

  // Prevent deleting yourself
  if (session.user.id === adminId) {
    throw new Error("You cannot delete your own admin account");
  }

  // Use Better Auth admin API to remove user
  await auth.api.removeUser({
    body: {
      userId: adminId,
    },
    headers: await headers(),
  });

  revalidatePath("/admin/admins");
  return true;
}
