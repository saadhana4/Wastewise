"use client";

import React from "react";
import { AdminTopNav } from "@/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050B0A] text-slate-100 flex flex-col antialiased selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background Radial Teal Vignette per Section 2 (Center #0D2422 fading to #050B0A) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 50% 30%, #0d2422 0%, #071716 45%, #050b0a 100%)",
        }}
      />

      {/* Slim Top Navigation Bar (~56px) - Replaces sidebar across all /admin routes */}
      <AdminTopNav />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
