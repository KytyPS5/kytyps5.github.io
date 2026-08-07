import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";

// Vite injects the deployment subpath here (e.g. "/KytyPS5-site/" on GitHub
// Pages, "/" in dev), so BrowserRouter matches routes under the base URL.
const BASENAME = import.meta.env.BASE_URL;

// Self-hosted fonts (no third-party CDN)
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";

import "@/styles/index.css";
import App from "@/App";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={BASENAME}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={200}>
          <App />
        </TooltipProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
