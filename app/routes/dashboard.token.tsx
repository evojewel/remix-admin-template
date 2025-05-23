import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "Kite Connect Token | Admin Dashboard" }];
};

export default function TokenGeneration() {
  const navigation = useNavigation();
  const [apiKey, setApiKey] = useState("bqg3ciqfqmjmrm44");
  const [redirectUri, setRedirectUri] = useState("");
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  
  useEffect(() => {
    // Set the default redirect URL based on the current host
    const host = window.location.origin;
    setRedirectUri(`${host}/redirect`);
    
    // Check API status
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api-status`);
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.status);
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        setApiStatus("offline");
      }
    };
    
    checkApiStatus();
    
    // Set up periodic check every 30 seconds
    const statusInterval = setInterval(checkApiStatus, 30000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const generateLoginUrl = () => {
    if (!apiKey) return "#";
    
    // Kite Connect API login URL
    return `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3&redirect_url=${encodeURIComponent(redirectUri)}`;
  };
  
  const isSubmitting = navigation.state === "submitting";

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 lg:text-3xl">
        Kite Connect Token Generator
      </h1>

      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="max-w-2xl">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">API Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                apiStatus === "online" ? "bg-green-100 text-green-800" :
                apiStatus === "offline" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {apiStatus === "online" ? "Online" :
                 apiStatus === "offline" ? "Offline" :
                 "Checking..."}
              </span>
            </div>
            
            {apiStatus === "offline" && (
              <div className="mb-6 mt-3 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  The API server is offline. Please ensure the API server is running before proceeding.
                </p>
              </div>
            )}
            
            <div className="p-4 text-sm border rounded-md bg-cyan-50 border-cyan-200">
              <p className="font-medium text-cyan-800">
                About the Authorization Process
              </p>
              <p className="mt-1 text-cyan-700">
                This tool will help you generate a Kite Connect access token by following these steps:
              </p>
              <ol className="mt-2 ml-4 list-decimal text-cyan-700">
                <li>You will be redirected to Zerodha's login page</li>
                <li>After login, Zerodha will redirect back with a request token</li>
                <li>We'll exchange the request token for an access token</li>
                <li>The access token will be stored securely for trading operations</li>
              </ol>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="mb-4">
              <label htmlFor="apiKey" className="block mb-1 text-sm font-medium text-slate-700">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter your Kite Connect API Key"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="redirectUri" className="block mb-1 text-sm font-medium text-slate-700">
                Redirect URI
              </label>
              <input
                type="text"
                id="redirectUri"
                name="redirectUri"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                className="block w-full px-3 py-2 border rounded-md border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter the redirect URI"
              />
              <p className="mt-1 text-xs text-slate-500">
                Must match the redirect URL registered in your Kite Connect app settings
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || apiStatus !== "online"}
              className="w-full"
            >
              {isSubmitting ? "Generating..." : "Generate Token"}
            </Button>
            
            <a
              href={generateLoginUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                apiStatus !== "online" ? "opacity-50 cursor-not-allowed" : ""
              }`}
              // onClick={(e) => {
              //   if (apiStatus !== "online") {
              //     e.preventDefault();
              //     alert("Please ensure the API server is running before proceeding.");
              //   }
              // }}
            >
              Authorize
            </a>
          </div>
          
          <div className="mt-6 text-sm text-center text-slate-500">
            <p>This will redirect you to Zerodha's login page.</p>
            <p className="mt-1">You'll be redirected back to this application after successful authorization.</p>
            {apiStatus === "online" && (
              <p className="mt-4">
                <a 
                  href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-600 underline hover:text-cyan-800"
                >
                  Check API server status
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 