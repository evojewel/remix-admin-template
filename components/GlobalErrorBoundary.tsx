import { useRouteError } from "@remix-run/react"

export function GlobalErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Oops!</h1>
        <p className="mt-4 text-lg text-slate-600">
          {isError(error) ? error.message : "Something went wrong"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

function isError(error: unknown): error is Error {
  return error instanceof Error
} 