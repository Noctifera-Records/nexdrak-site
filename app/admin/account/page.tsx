"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useNotifications } from "@/components/notification-system";

export default function AdminAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const supabase = createClient();
  const { showNotification } = useNotifications();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      // Obtener perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          username: profile.username || "",
        }));
      }

      setLoadingProfile(false);
    };

    getUser();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateProfile = async () => {
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          email: formData.email,
        })
        .eq("id", user.id);

      if (profileError) {
        showNotification({
          type: "error",
          title: "Error updating profile",
          message: profileError.message,
        });
        return;
      }

      // Actualizar email si cambió
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) {
          showNotification({
            type: "error",
            title: "Error updating email",
            message: emailError.message,
          });
          return;
        }
      }

      showNotification({
        type: "success",
        title: "Updated profile",
        message: "Your information has been successfully updated",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Unexpected error",
        message: "An error occurred while updating the profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Validation error",
        message: "Complete all password fields",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Validation error",
        message: "Passwords do not match",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification({
        type: "error",
        title: "Validation error",
        message: "The password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) {
        showNotification({
          type: "error",
          title: "Error changing password",
          message: error.message,
        });
        return;
      }

      showNotification({
        type: "success",
        title: "Password updated",
        message: "Your password has been successfully changed",
      });

      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      showNotification({
        type: "error",
        title: "Unexpected error",
        message: "Unexpected error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-white">Loading information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Account - Admin</h1>
        <p className="text-gray-400">
          Manage your administrator information
        </p>
      </div>

      <div className="space-y-6">
        {/* Información del Perfil */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-white">
                User Name
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={updateProfile}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Actualizando..." : "Actualizar Perfil"}
            </Button>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="text-white">
                New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Button
              onClick={updatePassword}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Información de la Cuenta */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="font-semibold">Type of account:</span>{" "}
                Administrator
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Member since:</span>{" "}
                {new Date(user?.created_at).toLocaleDateString("es-ES")}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">User ID:</span> {user?.id}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Permits:</span> Full access
                to the administration panel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
