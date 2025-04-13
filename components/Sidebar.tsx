import { Link, useLocation } from "@remix-run/react"
import { cn } from "~/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Breakout", href: "/dashboard/breakout" },
  { name: "Historical", href: "/dashboard/historical" },
  { name: "Backtest", href: "/dashboard/backtest" },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800">
      <div className="flex h-16 flex-shrink-0 items-center px-4">
        <Link to="/" className="text-xl font-bold text-white">
          Kite Admin
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                location.pathname === item.href
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
} 