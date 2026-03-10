'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function updateUserProfile(userId: string, updates: { role?: string, username?: string }) {
  try {
    // 1. Verify the current user is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized: No user logged in' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { error: 'Unauthorized: Admin privileges required' }
    }

    // 2. Use service role client to bypass RLS and update the target user
    const adminSupabase = createServiceRoleClient()
    
    const { error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user profile:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating user profile:', error)
    return { error: 'Internal server error' }
  }
}
