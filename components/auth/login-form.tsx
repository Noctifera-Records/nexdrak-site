"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        toast.success("Successfully logged in");
        router.push("/");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to login");
      }
    });
    setLoading(false);
  };

  const handleSpotifyLogin = async () => {
    setSpotifyLoading(true);
    await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/"
    }, {
        onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to login with Spotify");
            setSpotifyLoading(false);
        }
    });
  };

  return (
    <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">

        <Button 
            variant="outline" 
            type="button" 
            className="w-full bg-black hover:bg-[#1DB954] text-white hover:text-black border-zinc-800 transition-colors" 
            onClick={handleSpotifyLogin}
            disabled={loading || spotifyLoading}
        >
            {spotifyLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.218.358-.686.474-1.044.255-2.887-1.765-6.521-2.164-10.803-1.185-.41.094-.821-.164-.915-.574-.094-.41.164-.821.574-.915 4.693-1.072 8.706-.613 11.933 1.358.358.219.474.687.255 1.061zm1.47-3.253c-.274.446-.856.59-1.302.316-3.303-2.03-8.342-2.617-12.247-1.433-.504.153-1.037-.134-1.19-.638-.153-.504.134-1.037.638-1.19 4.455-1.353 10.005-.705 13.785 1.619.446.274.59.856.316 1.306zm.127-3.398C15.187 8.24 8.71 8.026 4.933 9.173c-.604.183-1.24-.165-1.423-.769-.183-.604.165-1.24.769-1.423 4.335-1.316 11.488-1.071 16.05 1.64.544.323.722 1.026.399 1.57-.323.544-1.026.722-1.57.399z"/>
                </svg>
            )}
            Spotify
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
    </div>
  );
}
