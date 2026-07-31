import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | NexDrak",
  robots: { index: false, follow: false },
};

export default function AuthResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
