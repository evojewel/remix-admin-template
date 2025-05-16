import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import { Button } from "~/components/ui/button";
import { GlobalErrorBoundary } from "~/components/GlobalErrorBoundary";
import DeleteIcon from "~/components/icons/Delete";
import EditIcon from "~/components/icons/Edit";
import ViewIcon from "~/components/icons/View";
import { formatDate } from "~/utils/formatDate";
import { getInitials } from "~/utils/getInitials";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Dashboard | Algo Admin",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  // Handle any form submissions here
  return Response.json({ message: "Action completed" });
}

export const loader: LoaderFunction = () => {
  // Redirect to the breakout strategy page
  return redirect("/dashboard/breakout");
};

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="flex justify-between gap-2 mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
          Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-900">Breakout Strategy</h2>
          <p className="mt-2 text-sm text-slate-600">
            Monitor and manage breakout trading strategies
          </p>
          <Button to="/dashboard/breakout" className="mt-4">
            View Strategy
          </Button>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-900">Historical Data</h2>
          <p className="mt-2 text-sm text-slate-600">
            Analyze historical market data and patterns
          </p>
          <Button to="/dashboard/historical" className="mt-4">
            View Data
          </Button>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-900">Backtest</h2>
          <p className="mt-2 text-sm text-slate-600">
            Test trading strategies with historical data
          </p>
          <Button to="/dashboard/backtest" className="mt-4">
            Run Backtest
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <GlobalErrorBoundary />;
}