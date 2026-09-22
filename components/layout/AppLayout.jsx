"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { getAuthToken } from "@/lib/api";

export function AppLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (!token) {
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex flex-col print:bg-white print:min-h-0 print:p-0 print:m-0 print:block">
      {/* Responsive Sidebar */}
      <div className="print:hidden">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300 print:pl-0 print:p-0 print:m-0 print:block">
        <div className="print:hidden">
          <Header setIsMobileOpen={setIsMobileOpen} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6 print:p-0 print:m-0 print:space-y-0 print:w-full print:max-w-none print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
