import React from 'react';
import { Link, Form } from "@remix-run/react"

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-sm text-gray-700">Profile</p>
      </div>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign out
        </button>
      </Form>
    </div>
  );
};

export default ProfilePopup; 