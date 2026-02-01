"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useNotifications } from "@/components/notification-system";

export default function AccountForm() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { showNotification } = useNotifications();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
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
        setFormData((prev: typeof formData) => ({
          ...prev,
          email: user.email || "",
          username: profile.username || "",
        }));
      }

      setLoadingProfile(false);
    };

    getUser();
  }, [router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const updateProfile = async () => {
    setLoading(true);

    try {
      // Verificar si el username ya existe (si cambió)
      if (formData.username !== profile.username) {
        const { data: existingUsername } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", formData.username)
          .neq("id", user.id)
          .single();

        if (existingUsername) {
          showNotification({
            type: "error",
            title: "Nombre de usuario no disponible",
            message: "Este nombre de usuario ya está en uso",
          });
          setLoading(false);
          return;
        }
      }

      // Actualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
        })
        .eq("id", user.id);

      if (profileError) {
        showNotification({
          type: "error",
          title: "Error al actualizar perfil",
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
            title: "Error al actualizar email",
            message: emailError.message,
          });
          return;
        }

        showNotification({
          type: "info",
          title: "Email actualizado",
          message: "Revisa tu nuevo email para confirmar el cambio",
        });
      }

      showNotification({
        type: "success",
        title: "Perfil actualizado",
        message: "Tu información ha sido actualizada exitosamente",
      });

      // Actualizar estado local
      setProfile((prev: any) => ({
        ...prev,
        username: formData.username,
        email: formData.email,
      }));
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error inesperado",
        message: "Ocurrió un error al actualizar el perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Error de validación",
        message: "Completa todos los campos de contraseña",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification({
        type: "error",
        title: "Error de validación",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification({
        type: "error",
        title: "Error de validación",
        message: "La contraseña debe tener al menos 6 caracteres",
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
          title: "Error al cambiar contraseña",
          message: error.message,
        });
        return;
      }

      showNotification({
        type: "success",
        title: "Contraseña actualizada",
        message: "Tu contraseña ha sido cambiada exitosamente",
      });

      // Limpiar campos de contraseña
      setFormData((prev: typeof formData) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error inesperado",
        message: "Ocurrió un error al cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Información del Perfil */}
      <Card className="bg-gray-700 border-gray-600">
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
              className="bg-gray-600 border-gray-500 text-white"
            />
          </div>

          <div>
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="bg-gray-600 border-gray-500 text-white"
            />
          </div>

          <Button
            onClick={updateProfile}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Cambiar Contraseña */}
      <Card className="bg-gray-700 border-gray-600">
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
              className="bg-gray-600 border-gray-500 text-white"
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
              className="bg-gray-600 border-gray-500 text-white"
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
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="font-semibold">Type of account:</span>{" "}
              {profile?.role === "admin" ? "Administrador" : "Usuario"}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Member since:</span>{" "}
              {new Date(user?.created_at).toLocaleDateString("es-ES")}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">User ID:</span> {user?.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
