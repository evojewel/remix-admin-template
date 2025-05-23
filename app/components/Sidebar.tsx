import { Link, useLocation } from "@remix-run/react";
import { Form } from "@remix-run/react";
import type { ComponentType } from "react";

interface NavigationItem {
  name: string;
  to: string;
  icon: ComponentType<any>;
}

interface SidebarProps {
  navigationItems: NavigationItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ navigationItems, isOpen, setIsOpen }: SidebarProps) {
  const { pathname } = useLocation();
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 md:flex-shrink-0`}>
        <div className="flex flex-col h-full border-r bg-white border-slate-200">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <Link
              className="flex items-center text-xl font-semibold text-slate-900"
              to="/"
            >
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className="w-8 h-8 mr-2"
              />
              ALGO
            </Link>
            <button
              className="p-2 text-gray-500 rounded-md hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Sidebar content */}
          <div className="flex flex-col flex-1 p-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname.startsWith(item.to);
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      isActive 
                        ? "text-cyan-700 bg-cyan-50" 
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className={`w-5 h-5 mr-3 ${
                      isActive ? "text-cyan-500" : "text-slate-400"
                    }`} />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto">
                        <svg 
                          className="w-5 h-5 text-cyan-400" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-slate-200">
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-100"
              >
                <svg 
                  className="w-5 h-5 mr-3 text-slate-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Logout
              </button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
