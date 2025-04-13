import { Form } from "@remix-run/react";

interface ProfilePopupProps {
  close: () => void;
}

export default function ProfilePopup({ close }: ProfilePopupProps) {
  return (
    <div className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
      <Form action="/auth/logout" method="post">
        <button
          type="submit"
          className="block w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
          onClick={close}
        >
          Sign out
        </button>
      </Form>
    </div>
  );
}
