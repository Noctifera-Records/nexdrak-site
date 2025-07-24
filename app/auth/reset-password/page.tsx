"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verificar si hay una sesión válida para cambio de contraseña
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        // Si no hay sesión, redirigir a login
        router.push(
          "/login?message=Sesión expirada. Solicita un nuevo enlace de restablecimiento."
        );
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return "La contraseña debe contener al menos un número";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("¡Contraseña actualizada exitosamente!");

        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push("/login?message=sucess");
        }, 2000);
      }
    } catch (err) {
      setError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Cambiar Contraseña</h1>
          <p className="text-gray-400">Ingresa tu nueva contraseña segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white">
                Nueva Contraseña
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  placeholder="Ingresa tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Contraseña
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white pr-10"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              "Actualizar Contraseña"
            )}
          </Button>
        </form>

        <div className="text-xs text-gray-500 space-y-2">
          <p className="font-medium">Requisitos de la contraseña:</p>
          <ul className="space-y-1">
            <li
              className={`flex items-center space-x-2 ${
                password.length >= 8 ? "text-green-400" : "text-gray-500"
              }`}
            >
              <span>•</span>
              <span>Mínimo 8 caracteres</span>
            </li>
            <li
              className={`flex items-center space-x-2 ${
                /(?=.*[a-z])/.test(password)
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <span>•</span>
              <span>Al menos una letra minúscula</span>
            </li>
            <li
              className={`flex items-center space-x-2 ${
                /(?=.*[A-Z])/.test(password)
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <span>•</span>
              <span>Al menos una letra mayúscula</span>
            </li>
            <li
              className={`flex items-center space-x-2 ${
                /(?=.*\d)/.test(password) ? "text-green-400" : "text-gray-500"
              }`}
            >
              <span>•</span>
              <span>Al menos un número</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
