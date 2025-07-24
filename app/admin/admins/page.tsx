"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AdminProfile {
  id: string;
  email: string;
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClientComponentClient();

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('id, email').eq('role', 'admin');
    if (error) {
      toast.error("Error fetching admins: " + error.message);
    } else {
      // Fetch emails from auth.users table
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        toast.error("Error fetching auth users: " + authError.message);
      } else {
        const adminsWithEmails = data.map(profile => {
          const authUser = authUsers.users.find(au => au.id === profile.id);
          return { id: profile.id, email: authUser?.email || 'N/A' };
        });
        setAdmins(adminsWithEmails);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error("Email and password are required.");
      return;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: newAdminEmail,
      password: newAdminPassword,
      email_confirm: true, // Automatically confirm email for admin
      user_metadata: { role: 'admin' }, // Set role in user_metadata for trigger
    });

    if (error) {
      toast.error("Error adding admin: " + error.message);
    } else {
      // The trigger in Supabase will handle adding to the profiles table with the 'admin' role
      toast.success("Admin added successfully.");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setIsDialogOpen(false);
      fetchAdmins();
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    // First, delete from profiles table
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', adminId);
    if (profileError) {
      toast.error("Error deleting admin profile: " + profileError.message);
      return;
    }

    // Then, delete from auth.users table
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
    if (authError) {
      toast.error("Error deleting auth admin: " + authError.message);
      return;
    }

    toast.success("Admin deleted successfully.");
    fetchAdmins();
  };

  if (loading) {
    return <div className="text-center">Loading admins...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Admins</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add New Admin</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Administrator</DialogTitle>
            <DialogDescription>
              Enter the email and a temporary password for the new administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.email}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the administrator account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteAdmin(admin.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}