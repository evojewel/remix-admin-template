import { Link, useLocation } from "@remix-run/react"
import { cn } from "~/lib/utils"

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navigation = [
  { name: "Breakout", href: "/dashboard/breakout" },
  { name: "Historical", href: "/dashboard/historical" },
  { name: "Backtest", href: "/dashboard/backtest" },
  { name: "API Token", href: "/dashboard/token" },
]

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex h-full flex-col bg-gray-800`}>
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 bg-gray-100">
        <Link to="/" className="text-xl font-bold">
          Algo Admin
        </Link>

        {/* Close button aligned at the right end */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label="Close sidebar"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4 bg-white">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-700 text-white"
                    : "text-gray-800 hover:bg-indigo-700 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  )
}
