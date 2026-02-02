import { createClient, handleSupabaseError, retrySupabaseOperation } from './client-optimized';

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export class AdminService {
  private supabase = createClient();

  // Get all admin users
  async getAdmins(): Promise<AdminProfile[]> {
    return retrySupabaseOperation(async () => {
      // First get admin profiles
      const { data: profiles, error: profilesError } = await this.supabase
        .from('profiles')
        .select('id, role, created_at')
        .eq('role', 'admin');

      if (profilesError) {
        throw new Error(handleSupabaseError(profilesError, 'fetch admin profiles'));
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Get user emails from auth metadata
      const adminIds = profiles.map(p => p.id);
      const adminsWithEmails: AdminProfile[] = [];

      // Try to get user info for each admin
      for (const profile of profiles) {
        try {
          // Get user info from auth
          const { data: user, error: userError } = await this.supabase.auth.admin.getUserById(profile.id);
          
          if (!userError && user?.user) {
            adminsWithEmails.push({
              id: profile.id,
              email: user.user.email || 'N/A',
              role: profile.role,
              created_at: profile.created_at
            });
          } else {
            // Fallback: include profile without email
            adminsWithEmails.push({
              id: profile.id,
              email: 'Email not available',
              role: profile.role,
              created_at: profile.created_at
            });
          }
        } catch (error) {
          console.warn(`Error getting user info for ${profile.id}:`, error);
          // Include profile without email
          adminsWithEmails.push({
            id: profile.id,
            email: 'Error retrieving email',
            role: profile.role,
            created_at: profile.created_at
          });
        }
      }

      return adminsWithEmails;
    });
  }

  // Create a new admin user
  async createAdmin(email: string, password: string): Promise<AdminProfile> {
    return retrySupabaseOperation(async () => {
      // Validate input
      if (!email?.trim()) {
        throw new Error('Email is required');
      }
      
      if (!password?.trim()) {
        throw new Error('Password is required');
      }

      if (password.length < 6) {
        throw new Error('The password must be at least 6 characters long.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('The email format is invalid.');
      }

      // Create user in auth
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true,
        user_metadata: { 
          role: 'admin',
          created_by_admin: true
        }
      });

      if (authError) {
        throw new Error(handleSupabaseError(authError, 'create admin user'));
      }

      if (!authData.user) {
        throw new Error('Error creating administrator user');
      }

      // The trigger should automatically create the profile, but let's verify
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger

      // Check if profile was created
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        // Manually create profile if trigger failed
        const { error: insertError } = await this.supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            role: 'admin',
            username: email.split('@')[0]
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }

      return {
        id: authData.user.id,
        email: email.trim(),
        role: 'admin',
        created_at: authData.user.created_at
      };
    });
  }

  // Delete an admin user (with proper error handling for 403)
  async deleteAdmin(adminId: string): Promise<boolean> {
    return retrySupabaseOperation(async () => {
      // Check current user permissions first
      const { data: currentUser } = await this.supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('You are not logged in');
      }

      // Get current user profile to check permissions
      const { data: currentProfile } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user.id)
        .single();

      if (!currentProfile || currentProfile.role !== 'admin') {
        throw new Error('You do not have administrator permissions.');
      }

      // Try to delete from profiles table first (this should work with RLS)
      const { error: profileError } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', adminId);

      if (profileError) {
        throw new Error(handleSupabaseError(profileError, 'delete admin profile'));
      }

      // Try to delete from auth.users table (this might fail with 403)
      try {
        const { error: authError } = await this.supabase.auth.admin.deleteUser(adminId);
        
        if (authError) {
          // Handle 403 Forbidden error specifically
          if (authError.message?.includes('403') || authError.message?.includes('Forbidden') || authError.status === 403) {
            // Profile was deleted successfully, but auth user couldn't be deleted
            // This is a partial success - inform the user
            throw new Error('User successfully deactivated. Note: To completely remove the user from the authentication system, contact the super administrator or configure the Service Role permissions in Supabase.');
          }
          
          if (authError.message?.includes('User not found')) {
            // User might already be deleted, consider it success
            console.warn('User not found in auth, might already be deleted');
            return true;
          }
          
          throw new Error(handleSupabaseError(authError, 'delete admin from auth'));
        }

        return true;
      } catch (error: any) {
        // If it's a permission error, provide helpful message
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          throw new Error('User disabled from the admin panel. To completely remove them from the authentication system, you need to configure the Service Role permissions in Supabase or contact the super administrator.');
        }
        
        throw error;
      }
    });
  }

  // Get site settings with error handling
  async getSiteSettings() {
    return retrySupabaseOperation(async () => {
      const { data, error } = await this.supabase
        .from('site_settings')
        .select('key, value')
        .order('key');

      if (error) {
        throw new Error(handleSupabaseError(error, 'fetch site settings'));
      }

      return data || [];
    });
  }

  // Update site settings
  async updateSiteSettings(settings: Record<string, string>) {
    return retrySupabaseOperation(async () => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value?.trim() || ''
      }));

      const promises = updates.map(({ key, value }) =>
        this.supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key)
      );

      const results = await Promise.allSettled(promises);
      
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (errors.length > 0) {
        console.error('Some settings failed to update:', errors);
        throw new Error(`Error al actualizar ${errors.length} configuración(es)`);
      }

      return true;
    });
  }
}
