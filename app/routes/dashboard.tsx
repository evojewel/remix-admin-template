import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useState } from "react";
import { useNavigation, useLocation } from "@remix-run/react";
import { Link, Form } from "@remix-run/react";

import MenuIcon from "~/components/icons/Menu";
import ProfilePopup from "~/components/ProfilePopup";
import Sidebar from "~/components/Sidebar";
import { getSession } from "~/session.server";
import { getSupabaseClient } from "~/utils/getSupabaseClient";

// Define icon components as regular functions returning SVG
const ChartBarSquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="8" y1="9" x2="8" y2="21" />
    <line x1="16" y1="13" x2="16" y2="21" />
    <line x1="12" y1="5" x2="12" y2="21" />
  </svg>
);

const BeakerIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v2m0 0v4a2 2 0 0 1-2 2H4m0 0h.01M4 11h.01M9 11h.01M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
    <path d="M7 15h10" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export async function loader({ request }: LoaderFunctionArgs) {
  // Temporarily bypassing authentication for development
  return Response.json({});
  
  try {
    getSupabaseClient();
  } catch (error) {
    return redirect("/");
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("__session");

  if (!token) {
    return redirect("/login");
  }

  return Response.json({});
}

export default function Dashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    {
      name: "Breakout Strategy",
      to: "/dashboard/breakout",
      icon: ChartBarSquareIcon,
    },
    {
      name: "Backtest",
      to: "/dashboard/backtest",
      icon: BeakerIcon,
    },
    {
      name: "Historical Data",
      to: "/dashboard/history",
      icon: HistoryIcon,
    },
    {
      name: "API Token",
      to: "/dashboard/token",
      icon: KeyIcon,
    },
  ];
  
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar navigationItems={navigationItems} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-end h-16 px-6 bg-white border-b border-slate-200">
          <div className="relative ml-auto">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center justify-center w-8 h-8 text-white bg-cyan-600 rounded-full">
                <span>JS</span>
              </div>
            </button>
            
            {isProfileOpen && <ProfilePopup close={() => setIsProfileOpen(false)} />}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
