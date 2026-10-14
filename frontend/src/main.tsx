import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="app-shell">
      <div className="device-frame">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </div>
    </div>
  </StrictMode>,
);
