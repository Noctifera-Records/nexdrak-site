"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    setPasswordStrength(score);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordStrength < 3) {
        toast.warning("Password is too weak. Try adding numbers, symbols, or uppercase letters.");
        return;
    }

    setLoading(true);
    await authClient.signUp.email({
      email,
      password,
      name,
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success("Account created. Please verify your email.");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to create account");
      }
    });
    setLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
          <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">Check your inbox</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            We've sent a verification link to <span className="font-medium text-foreground">{email}</span>.
          </p>
          <p className="text-sm text-muted-foreground/80">
            Please verify your email before logging in.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/login")} 
          className="w-full"
          variant="default"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          placeholder="Your Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="you@example.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => {
            setPassword(e.target.value);
            checkPasswordStrength(e.target.value);
          }} 
          required 
          minLength={8}
        />
        {password && (
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-300 ${
                        passwordStrength <= 1 ? "bg-red-500 w-1/4" :
                        passwordStrength === 2 ? "bg-yellow-500 w-2/4" :
                        passwordStrength === 3 ? "bg-blue-500 w-3/4" :
                        "bg-green-500 w-full"
                    }`}
                />
            </div>
        )}
        <p className="text-xs text-muted-foreground">
            {passwordStrength <= 1 && "Weak"}
            {passwordStrength === 2 && "Fair"}
            {passwordStrength === 3 && "Good"}
            {passwordStrength >= 4 && "Strong"}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          minLength={8}
          className={password && confirmPassword && password !== confirmPassword ? "border-red-500" : ""}
        />
        {password && confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign Up
      </Button>
    </form>
  );
}
