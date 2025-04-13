import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

import { createUserSession, getSession } from "../session.server";

import Button from "~/components/ui/button";
import TextField from "~/components/TextField";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Login | Kite Admin",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // TODO: Implement proper authentication
  if (email === "admin@example.com" && password === "password") {
    return createUserSession({
      request,
      userId: "1",
      redirectTo: "/dashboard",
    });
  }

  return { error: "Invalid email or password" };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (session.has("userId")) {
    return redirect("/dashboard");
  }
  return null;
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
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email address"
              required
            />
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              required
            />

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
