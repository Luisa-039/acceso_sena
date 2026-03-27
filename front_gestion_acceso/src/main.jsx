import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/authContext";
import { SedeProvider } from "@/context/sedeContext";

import App from "./App";
import "./styles/sweetalert.css";

import { MaterialUIControllerProvider } from "./context";

ReactDOM.createRoot(document.getElementById("root")).render(
    <MaterialUIControllerProvider>
      <BrowserRouter>
        <AuthProvider>
          <SedeProvider>
            <App />
          </SedeProvider>
        </AuthProvider>
      </BrowserRouter>
    </MaterialUIControllerProvider>
);