'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useNotifications } from '@/components/notification-system';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { showNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'All fields are required'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Passwords do not match'
      });
      return false;
    }

    if (formData.password.length < 6) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Registrar usuario
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            role: 'user'
          }
        }
      });

      if (error) {
        // Handle specific unique constraint errors
        if (error.message.includes('User already registered') || error.status === 400 || error.status === 422) {
           showNotification({
            type: 'error',
            title: 'Registration Failed',
            message: 'This email or username is already taken. Please try another one.'
          });
        } else {
          showNotification({
            type: 'error',
            title: 'Registration Error',
            message: error.message
          });
        }
        return;
      }

      showNotification({
        type: 'success',
        title: 'Account Created Successfully',
        message: 'Your account has been created'
      });

      router.push('/');
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An error occurred while creating the account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="your_username"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="text-center">
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
