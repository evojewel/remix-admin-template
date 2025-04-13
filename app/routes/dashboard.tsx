import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "../session.server";

import Header from "~/components/Header";
import Sidebar from "~/components/Sidebar";
import { ChartBarIcon, ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (!session.has("userId")) {
    return redirect("/login");
  }
  return null;
}

const navigationItems = [
  {
    name: "Breakout Strategy",
    to: "/dashboard/breakout",
    icon: ChartBarIcon,
  },
  {
    name: "Historical Data",
    to: "/dashboard/historical",
    icon: ClockIcon,
  },
  {
    name: "Backtest",
    to: "/dashboard/backtest",
    icon: CalculatorIcon,
  },
];

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        navigationItems={navigationItems}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
