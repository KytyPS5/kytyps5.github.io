import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";

// Self-hosted fonts (no third-party CDN)
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import "@/styles/index.css";
import App from "@/App";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <App />
        </TooltipProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
