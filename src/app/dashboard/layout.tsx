'use client'
import HeaderDashboard from "@/components/dashboard/header";
import { AuthContextProvider } from "@/components/firebase/AuthContext";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthContextProvider>
      <div className="flex flex-col min-h-screen ">
        <HeaderDashboard />
        {children}
        <div>footer</div>
      </div>
    </AuthContextProvider>
  );
}
