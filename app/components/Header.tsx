import { useState } from "react";
import { Link } from "@remix-run/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import ProfilePopup from "./ProfilePopup";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200">
      <div className="flex items-center">
        <button
          type="button"
          className="p-2 text-gray-500 rounded-md hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          onClick={onMenuClick}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center">
        <div className="relative">
          <button
            type="button"
            className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-medium">
              U
            </div>
          </button>
          
          <ProfilePopup 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
} 