"use client";
import HeaderDashboard from "@/components/dashboard/header";
import { AuthContextProvider } from "@/components/firebase/AuthContext";
import { Link } from "@nextui-org/react";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = [
    { title: "Home", href: "home" },
    { title: "Admin", href: "admin" },
    { title: "Operational", href: "operational" },
  ];
  return (
    <AuthContextProvider>
      <div className="flex flex-col min-h-screen">
        <div className="sm:hidden">
          <HeaderDashboard />
        </div>
        <div className="sm:flex justify-between hidden px-5 py-5 sticky">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Keiko Julia</div>
          <div>Logo</div>
          <div className="flex flex-row">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                color={"primary"}
								className="mx-5"
                href={item.href}
                size="lg"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        {children}
        <div>footer</div>
      </div>
    </AuthContextProvider>
  );
}
