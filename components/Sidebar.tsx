import { Link, useLocation } from "@remix-run/react"
import { cn } from "~/lib/utils"

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navigation = [
  // { name: "Dashboard", href: "/dashboard" },
  { name: "Breakout", href: "/dashboard/breakout" },
  { name: "Historical", href: "/dashboard/historical" },
  { name: "Backtest", href: "/dashboard/backtest" },
  { name: "API Token", href: "/dashboard/token" },
]

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex h-full flex-col bg-gray-800`}>
      <div className="flex h-16 flex-shrink-0 items-center px-4">
        <Link to="/" className="text-xl font-bold">
          Algo Admin
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              // className={cn(
              //   "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
              //   location.pathname.startsWith(item.href)
              //     ? "bg-gray-900 text-white"
              //     : "text-gray-300 hover:bg-gray-700 hover:text-white"
              // )}
              className="group flex items-center rounded-md px-2 py-2 text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
} 