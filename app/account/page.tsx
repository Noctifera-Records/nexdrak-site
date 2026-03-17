"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Shield, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await authClient.updateUser({
        name: name,
      }, {
        onSuccess: () => {
          toast.success("Profile updated successfully");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to update profile");
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await authClient.deleteUser({
      }, {
        onSuccess: () => {
          toast.success("Account deleted successfully");
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to delete account");
        }
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">MY ACCOUNT</h1>
        <p className="text-muted-foreground">Manage your profile settings and account preferences.</p>
      </div>

      <Separator />

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your display name and view your account details.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground border border-border">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{session.user.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">Email address cannot be changed currently.</p>
              </div>
              <div className="grid gap-2">
                <Label>Account Role</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground border border-border">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm capitalize">{session.user.role || "user"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <Button type="submit" disabled={updating || name === session.user.name}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security / Password section placeholder */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Password & Security</CardTitle>
            <CardDescription>To change your password, please use the "Forgot Password" link on the login page.</CardDescription>
          </CardHeader>
          <CardFooter className="bg-muted/30 pt-6">
            <Button variant="outline" asChild>
                <a href="/auth/reset-password">Change Password</a>
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Permanently delete your account and all associated data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
          <CardFooter className="bg-destructive/10 pt-6 border-t border-destructive/10">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
