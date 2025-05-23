import { Form } from "@remix-run/react";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePopup({ isOpen, onClose }: ProfilePopupProps) {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
          <div className="font-medium">User</div>
          <div className="text-gray-500">user@example.com</div>
        </div>
        
        <Form action="/auth/logout" method="post" className="block w-full text-left">
          <button
            type="submit"
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Sign out
          </button>
        </Form>
      </div>
    </div>
  );
}
