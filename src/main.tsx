import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global debugging hooks to surface issues in Lovable console
console.log("[FloorPlanWizard] Boot starting");
window.addEventListener("error", (e) => {
  console.error("[FloorPlanWizard] Global error:", e.error || e.message, e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[FloorPlanWizard] Unhandled rejection:", e.reason);
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[FloorPlanWizard] Root element not found");
} else {
  console.log("[FloorPlanWizard] Rendering App to #root");
  createRoot(rootEl).render(<App />);
}
