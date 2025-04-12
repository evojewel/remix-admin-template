import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import Button from "~/components/Button";

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
        const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/`);
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        setApiStatus("offline");
      }
    };
    
    checkApiStatus();
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
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
            <div className="flex items-center mb-2">
              <div 
                className={`w-2 h-2 mr-2 rounded-full ${
                  apiStatus === "checking" ? "bg-yellow-500" :
                  apiStatus === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <p className="text-sm text-slate-600">
                API Server Status: 
                <span className={
                  apiStatus === "checking" ? "text-yellow-600" :
                  apiStatus === "online" ? "text-green-600" : "text-red-600"
                }>
                  {" "}{apiStatus === "checking" ? "Checking..." : 
                     apiStatus === "online" ? "Online" : "Offline"}
                </span>
                {apiStatus === "offline" && (
                  <span className="ml-2 text-red-600">
                    (Make sure to start the backend API server)
                  </span>
                )}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="apiKey" className="block mb-1 text-sm font-medium text-slate-700">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
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
          
          <div className="flex justify-center">
            <a
              href={generateLoginUrl()}
              className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md ${
                apiStatus === "online" 
                  ? "bg-cyan-600 hover:bg-cyan-700" 
                  : "bg-slate-400 cursor-not-allowed"
              }`}
              disabled={isSubmitting || !apiKey || !redirectUri || apiStatus !== "online"}
              onClick={(e) => {
                if (apiStatus !== "online") {
                  e.preventDefault();
                  alert("Please ensure the API server is running before proceeding.");
                }
              }}
            >
              {isSubmitting ? "Processing..." : "Authorize with Kite Connect"}
            </a>
          </div>
          
          <div className="mt-6 text-sm text-center text-slate-500">
            <p>This will redirect you to Zerodha's login page.</p>
            <p className="mt-1">You'll be redirected back to this application after successful authorization.</p>
            {apiStatus === "online" && (
              <p className="mt-4">
                <a 
                  href={`${process.env.API_BASE_URL || 'http://localhost:3001'}`} 
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