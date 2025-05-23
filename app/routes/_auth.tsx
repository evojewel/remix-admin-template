import { Outlet } from "@remix-run/react";
import Logo from "~/components/Logo";

export default function AuthLayout() {
  return (
    <main className="flex grow">
      <div className="absolute left-4 top-4">
        <Logo />
      </div>
      <Outlet />
    </main>
  );
}
