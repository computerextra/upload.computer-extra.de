import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./Layout";

export const App = lazy(() => import("@/App.tsx"));
export const Success = lazy(() => import("@/Success.tsx"));
export const Fail = lazy(() => import("@/Fail.tsx"));
export const Download = lazy(() => import("@/Download.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<App />} />
          <Route path="Fehler" element={<Fail />} />
          <Route path=":hash" element={<Success />} />
          <Route path=":hash/download" element={<Download />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
