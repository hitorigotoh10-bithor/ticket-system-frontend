import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);