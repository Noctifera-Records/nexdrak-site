"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminAccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // MFA State
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; uri: string; backupCodes: string[] } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  
  // Dialog States
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForMfa, setPasswordForMfa] = useState("");
  const [mfaAction, setMfaAction] = useState<"enable" | "disable" | null>(null);

  const handleUpdateProfile = async () => {
    setLoading(true);
    await authClient.updateUser({
      name: name,
    }, {
        onSuccess: () => {
            toast.success("Profile updated");
        },
        onError: (ctx) => {
            toast.error(ctx.error.message);
        }
    });
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    setLoading(true);
    await authClient.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        revokeOtherSessions: true,
    }, {
        onSuccess: () => {
            toast.success("Password updated");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (ctx) => {
            toast.error(ctx.error.message);
        }
    });
    setLoading(false);
  };

  const initiateMfaAction = (action: "enable" | "disable") => {
    setMfaAction(action);
    setPasswordForMfa("");
    setIsPasswordDialogOpen(true);
  };

  const handleMfaPasswordSubmit = async () => {
    if (!passwordForMfa) {
        toast.error("Password is required");
        return;
    }
    
    setIsPasswordDialogOpen(false);
    
    if (mfaAction === "enable") {
        await enableMFA(passwordForMfa);
    } else if (mfaAction === "disable") {
        await disableMFA(passwordForMfa);
    }
  };

  const enableMFA = async (password: string) => {
      const res = await authClient.twoFactor.enable({
          password
      });

      if (res.data) {
          // Explicitly convert backupCodes to string[] if needed, though type assertion usually handles it
          const secret = new URL(res.data.totpURI).searchParams.get("secret") || "";
          
          setMfaSetup({
            secret,
            uri: res.data.totpURI,
            backupCodes: res.data.backupCodes || [] 
          });
      } else if (res.error) {
          toast.error(res.error.message);
      }
  };

  const verifyMFA = async () => {
      if (!mfaCode) return;
      
      const res = await authClient.twoFactor.verifyTotp({
          code: mfaCode,
      });

      if (res.data) {
          toast.success("MFA successfully enabled");
          // Store backup codes in local storage or prompt user to download them before clearing state?
          // Actually better to keep showing them or rely on the user having copied them from the setup screen.
          // But once verified, we usually clear setup state.
          // Let's show a success message that reminds them to save codes if they haven't.
          setMfaSetup(null);
          window.location.reload(); 
      } else if (res.error) {
          toast.error(res.error.message);
      }
  };

  const disableMFA = async (password: string) => {
      await authClient.twoFactor.disable({
          password
      }, {
          onSuccess: () => {
              toast.success("MFA disabled");
              window.location.reload();
          },
          onError: (ctx) => {
              toast.error(ctx.error.message);
          }
      });
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Account</h1>
        <p className="text-muted-foreground">Manage your profile and security</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder={user?.name || ""}
            />
          </div>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Seguridad MFA */}
      <Card>
          <CardHeader>
              <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
          </CardHeader>
          <CardContent>
              {user?.twoFactorEnabled ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-500/10 border-green-500/20">
                      <div className="flex items-center gap-3">
                          <ShieldCheck className="h-6 w-6 text-green-500" />
                          <div>
                              <p className="font-medium text-green-700 dark:text-green-400">MFA Enabled</p>
                              <p className="text-sm text-green-600/80 dark:text-green-400/80">Your account is protected.</p>
                          </div>
                      </div>
                      <Button variant="destructive" onClick={() => initiateMfaAction("disable")}>Disable</Button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {!mfaSetup ? (
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                              <div className="flex items-center gap-3">
                                  <ShieldAlert className="h-6 w-6 text-yellow-500" />
                                  <div>
                                      <p className="font-medium text-yellow-700 dark:text-yellow-400">MFA Disabled</p>
                                      <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">We recommend enabling it for better security.</p>
                                  </div>
                              </div>
                              <Button onClick={() => initiateMfaAction("enable")}>Configure MFA</Button>
                          </div>
                      ) : (
                          <div className="space-y-4 border p-4 rounded-lg">
                              <p className="font-medium">Scan this code in your authenticator app (Google Auth, Authy, etc.):</p>
                              <div className="bg-white p-6 rounded-lg shadow-sm border mx-auto max-w-[220px]">
                                  {mfaSetup.uri ? (
                                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                      <QRCode
                                        size={256}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={mfaSetup.uri}
                                        viewBox={`0 0 256 256`}
                                        fgColor="#000000"
                                        bgColor="#ffffff"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-40 w-40 bg-gray-200 animate-pulse rounded flex items-center justify-center text-xs text-gray-500">
                                        Loading QR...
                                    </div>
                                  )}
                              </div>
                              <div className="text-xs text-muted-foreground break-all font-mono bg-muted p-2 rounded">
                                {mfaSetup.secret}
                              </div>
                              <div className="grid gap-2">
                                  <Label>Verification Code</Label>
                                  <Input 
                                      value={mfaCode} 
                                      onChange={(e) => setMfaCode(e.target.value)} 
                                      placeholder="123456" 
                                  />
                              </div>
                              <Button onClick={verifyMFA}>Verify and Enable</Button>
                              
                              {/* Backup Codes Display */}
                              {mfaSetup.backupCodes && mfaSetup.backupCodes.length > 0 && (
                                <div className="mt-4 p-4 bg-muted rounded-lg border">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                                    <p className="font-semibold text-sm">Backup Codes (Save these!)</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    If you lose access to your authenticator app, use these codes to log in. Each code can only be used once.
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {mfaSetup.backupCodes.map((code, index) => (
                                      <div key={index} className="bg-background border rounded px-2 py-1 text-xs font-mono text-center">
                                        {code}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current">Current Password</Label>
            <Input 
                id="current" 
                type="password" 
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new">New Password</Label>
            <Input 
                id="new" 
                type="password" 
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input 
                id="confirm" 
                type="password" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Password Confirmation Dialog for MFA */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Password</DialogTitle>
            <DialogDescription>
              Please enter your password to {mfaAction} Two-Factor Authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="mfa-password">Password</Label>
            <Input
              id="mfa-password"
              type="password"
              value={passwordForMfa}
              onChange={(e) => setPasswordForMfa(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMfaPasswordSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
