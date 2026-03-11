"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
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
import ImageUpload from "@/components/image-upload";

export default function AccountForm() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    image: session?.user?.image || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleUpdateProfile = async () => {
    setLoading(true);
    await authClient.updateUser({
      name: formData.name,
      image: formData.image,
    }, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to update profile");
      }
    });
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    await authClient.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      revokeOtherSessions: true,
    }, {
      onSuccess: () => {
        toast.success("Password changed successfully");
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to change password");
      }
    });
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    await authClient.deleteUser({
        callbackURL: "/"
    }, {
      onSuccess: () => {
        toast.success("Account deleted successfully");
        router.push("/");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to delete account");
        setLoading(false);
      }
    });
  };

  if (!session) {
    return (
        <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
                {formData.image && (
                    <img 
                        src={formData.image} 
                        alt="Profile" 
                        className="h-16 w-16 rounded-full object-cover border"
                    />
                )}
                <div className="flex-1">
                    <ImageUpload 
                        value={formData.image} 
                        onChange={(url) => setFormData(prev => ({ ...prev, image: url || "" }))}
                        label="Upload new picture"
                        maxSizeMB={2}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Max size: 2MB. Formats: JPG, PNG, WEBP.</p>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={session.user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Ensure your account is using a strong password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              type="password"
              value={formData.currentPassword} 
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                id="newPassword" 
                type="password"
                value={formData.newPassword} 
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                id="confirmPassword" 
                type="password"
                value={formData.confirmPassword} 
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleChangePassword} disabled={loading} variant="outline">
            Update Password
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-destructive/10 p-4 rounded-lg flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                    <h4 className="font-semibold text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
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
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
