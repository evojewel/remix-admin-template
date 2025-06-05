import type {
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";

import { getSession } from "../session.server";

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



export default function LogIn() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [API_URL, setApiUrl] = useState("https://algo-api.evoqins.dev");

  // Set API URL based on environment (client-side like other components)
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 
      (window.location.hostname === "localhost" 
        ? "http://localhost:8000"
        : "https://algo-api.evoqins.dev");
    setApiUrl(apiUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Call the external API directly (client-side like other components)
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const loginResult = await response.json();

      if (loginResult.success) {
        // For now, just navigate to dashboard (session will be handled later)
        navigate("/dashboard");
      } else {
        // Show error message from backend
        setError(loginResult.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
