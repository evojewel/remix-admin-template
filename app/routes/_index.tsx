import type { MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import Guide from "~/components/Guide";
import Logo from "~/components/Logo";
import { getSupabaseClient } from "~/utils/getSupabaseClient";

export const loader: LoaderFunction = () => {
  // Redirect to the breakout strategy page
  return redirect("/dashboard/breakout");
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return null;
}
