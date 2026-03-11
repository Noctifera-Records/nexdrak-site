"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client with Service Role Key
// This bypasses RLS, allowing admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.BETTER_AUTH_SECRET!, // Fallback if needed, but should be SERVICE_ROLE
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface AdminProfile {
  id: string;
  email: string;
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

  // First get admin profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, role, created_at')
    .eq('role', 'admin');

  if (profilesError) {
    throw new Error(`Error fetching admin profiles: ${profilesError.message}`);
  }

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const adminsWithEmails: AdminProfile[] = [];

  // Try to get user info for each admin from Auth
  for (const profile of profiles) {
    try {
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      
      if (!userError && user?.user) {
        adminsWithEmails.push({
          id: profile.id,
          email: user.user.email || 'N/A',
          role: profile.role,
          created_at: profile.created_at
        });
      } else {
        adminsWithEmails.push({
          id: profile.id,
          email: 'Email not available',
          role: profile.role,
          created_at: profile.created_at
        });
      }
    } catch (error) {
      console.warn(`Error getting user info for ${profile.id}:`, error);
      adminsWithEmails.push({
        id: profile.id,
        email: 'Error retrieving email',
        role: profile.role,
        created_at: profile.created_at
      });
    }
  }

  return adminsWithEmails;
}

export async function createAdmin(email: string, password: string): Promise<AdminProfile> {
  await checkAdminAuth();

  if (!email?.trim() || !password?.trim()) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: password,
    email_confirm: true,
    user_metadata: { 
      role: 'admin',
      created_by_admin: true
    }
  });

  if (authError) {
    throw new Error(`Error creating admin user: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('Error creating administrator user');
  }

  // Check if profile was created by trigger
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    // Manually create profile if trigger failed
    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'admin',
        username: email.split('@')[0]
      });

    if (insertError) {
      console.error('Error creating profile manually:', insertError);
    }
  }

  revalidatePath("/admin/admins");

  return {
    id: authData.user.id,
    email: email.trim(),
    role: 'admin',
    created_at: authData.user.created_at
  };
}

export async function deleteAdmin(adminId: string): Promise<boolean> {
  const session = await checkAdminAuth();

  // Prevent deleting self (check against Supabase Auth ID if linked, or Better Auth ID)
  // Note: Better Auth ID might be different from Supabase Auth ID.
  // We assume adminId passed here is the Supabase Auth ID (from profiles table).
  
  // Try to delete from profiles table first
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', adminId);

  if (profileError) {
    throw new Error(`Error deleting admin profile: ${profileError.message}`);
  }

  // Try to delete from auth.users table
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(adminId);
  
  if (authError) {
    // Handle 403 Forbidden specifically (though with service role it shouldn't happen usually)
    if (authError.message?.includes('403') || authError.status === 403) {
      throw new Error('User successfully deactivated. Note: To completely remove the user from the authentication system, contact the super administrator.');
    }
    
    if (authError.message?.includes('User not found')) {
      return true;
    }
    
    throw new Error(`Error deleting admin from auth: ${authError.message}`);
  }

  revalidatePath("/admin/admins");
  return true;
}
