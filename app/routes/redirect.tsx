import { useEffect, useState } from "react";
import { useSearchParams, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Kite Connect Authorization | Admin Dashboard" }];
};

export default function KiteRedirect() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    async function processRequestToken() {
      const requestToken = searchParams.get("request_token");
      
      if (!requestToken) {
        setStatus("error");
        setMessage("No request token found in URL parameters.");
        return;
      }
      
      try {
        // Send the request token to your API backend
        const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/token-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestToken,
            // API key and secret are stored on the server side for security
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate access token");
        }
        
        const data = await response.json();
        
        // Success - show success message and token
        setStatus("success");
        setMessage(`Access token generated: ${data.accessToken}`);
        
        // Optionally, update your .env file or database with the token
        // This would typically be handled by the backend
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    }
    
    processRequestToken();
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center text-slate-900">
          Kite Connect Authorization
        </h1>
        
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-t-cyan-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-600">Processing your authentication...</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="space-y-4">
            <div className="p-4 text-sm border rounded-md bg-green-50 border-green-200">
              <p className="font-medium text-green-800">
                Authentication successful!
              </p>
              <p className="mt-2 text-green-700">
                {message}
              </p>
            </div>
            
            <div className="flex justify-center">
              <Link 
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-cyan-600 hover:bg-cyan-700"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {status === "error" && (
          <div className="space-y-4">
            <div className="p-4 text-sm border rounded-md bg-rose-50 border-rose-200">
              <p className="font-medium text-rose-800">
                Authentication failed
              </p>
              <p className="mt-2 text-rose-700">
                {message}
              </p>
            </div>
            
            <div className="flex justify-center">
              <Link 
                to="/dashboard/token"
                className="px-4 py-2 text-sm font-medium text-white rounded-md bg-cyan-600 hover:bg-cyan-700"
              >
                Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 