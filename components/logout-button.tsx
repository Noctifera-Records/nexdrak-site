"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useNotifications } from '@/components/notification-system'

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function LogoutButton({ 
  className = "", 
  variant = "ghost", 
  size = "default" 
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { showNotification } = useNotifications()

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        showNotification({
          type: 'error',
          title: 'Sign Out Error',
          message: error.message
        })
      } else {
        showNotification({
          type: 'success',
          title: 'Signed Out',
          message: 'You have successfully signed out'
        })
        
        setTimeout(() => {
          router.push('/login')
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An error occurred while signing out'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
    </Button>
  )
}