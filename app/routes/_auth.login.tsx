import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

import { getSession, createUserSession } from "../session.server";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Login | Algo Admin",
    },
  ];
};



export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (session.has("userId")) {
    return redirect("/dashboard");
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    // Determine the API URL based on environment
    const isProduction = process.env.NODE_ENV === "production";
    const API_URL = isProduction 
      ? "https://algo-api.evoqins.dev"
      : "http://localhost:8000";

    // Call the backend login API
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      return json({ error: `HTTP error! status: ${response.status}` }, { status: 400 });
    }

    const loginResult = await response.json();

    if (loginResult.success) {
      // Create session and redirect to dashboard
      return createUserSession({
        request,
        userId: loginResult.user_id || email,
        redirectTo: "/dashboard",
      });
    } else {
      // Return error message from backend
      return json({ error: loginResult.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Login failed. Please check your connection and try again." }, { status: 500 });
  }
}

export default function LogIn() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full"
              />
            </div>

            {actionData?.error && (
              <div className="text-sm text-red-600">{actionData.error}</div>
            )}

            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
