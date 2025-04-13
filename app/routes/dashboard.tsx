import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useState } from "react";
import { useNavigation, useLocation } from "@remix-run/react";
import { Link, Form } from "@remix-run/react";

import MenuIcon from "~/components/icons/Menu";
import ProfilePopup from "~/components/ProfilePopup";
import Sidebar from "~/components/Sidebar";
import { getSession } from "../session.server";

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
    <path d="M9.5 3h5v5.5c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2V3z" />
    <path d="M4.5 3h15v5.5c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2V3z" />
    <path d="M4.5 10.5h15v10c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2v-10z" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session.has("userId")) {
    return redirect("/login");
  }
  return null;
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigation = useNavigation();
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <button
            className="p-2 text-gray-500 rounded-md hover:text-gray-600 hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MenuIcon />
          </button>
          <div className="flex items-center space-x-4">
            <ProfilePopup />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
