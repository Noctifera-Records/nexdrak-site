"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: (ctx) => {
        if (ctx.data?.twoFactorRedirect) {
            setIsTwoFactor(true);
            toast.info("Two-factor authentication required");
        } else {
            toast.success("Successfully logged in");
            router.push("/");
        }
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to login");
      }
    });
    setLoading(false);
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useBackupCode && twoFactorCode.length < 6) return;
    if (useBackupCode && twoFactorCode.length < 8) return; // Backup codes are usually longer
    
    setLoading(true);

    if (useBackupCode) {
        await authClient.twoFactor.verifyBackupCode({
            code: twoFactorCode,
            trustDevice: true,
        }, {
            onSuccess: () => {
                toast.success("Successfully verified with backup code");
                router.push("/admin");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message || "Invalid backup code");
            }
        });
    } else {
        await authClient.twoFactor.verifyOtp({
            code: twoFactorCode,
            trustDevice: true,
        }, {
            onSuccess: () => {
                toast.success("Successfully verified");
                router.push("/admin");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message || "Invalid verification code");
            }
        });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/"
    }, {
        onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to login with Google");
            setGoogleLoading(false);
        }
    });
  };

  if (isTwoFactor) {
      return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                    {useBackupCode 
                        ? "Enter one of your backup codes." 
                        : "Enter the 6-digit code from your authenticator app."}
                </p>
            </div>
            
            <form onSubmit={handleTwoFactorVerify} className="space-y-4 flex flex-col items-center">
                {!useBackupCode ? (
                    <InputOTP 
                        maxLength={6} 
                        value={twoFactorCode} 
                        onChange={(value) => setTwoFactorCode(value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                ) : (
                    <Input 
                        placeholder="Enter backup code" 
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="text-center font-mono tracking-widest"
                    />
                )}

                <Button type="submit" className="w-full" disabled={loading || twoFactorCode.length < 6}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify
                </Button>
                
                <div className="flex flex-col gap-2 w-full">
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="text-muted-foreground"
                        onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setTwoFactorCode("");
                        }}
                        type="button"
                    >
                        {useBackupCode ? "Use Authenticator App" : "I lost my device / Use Backup Code"}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground"
                        onClick={() => setIsTwoFactor(false)}
                        type="button"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Button>
                </div>
            </form>
        </div>
      );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">

        <Button 
            variant="outline" 
            type="button" 
            className="w-full" 
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
        >
            {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
            )}
            Google
        </Button>

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
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                    href="/forgot-password" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                    Forgot password?
                </Link>
            </div>
            <Input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            />
        </div>
        <Button type="submit" className="w-full" disabled={loading || googleLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
        </Button>
        </form>

        {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div> */}

    </div>
  );
}
