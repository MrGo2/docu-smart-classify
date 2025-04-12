
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/layout/SidebarLayout";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import BatchUpload from "./pages/BatchUpload";
import Extraction from "./pages/Extraction";
import Settings from "./pages/Settings";
import ProjectsManagement from "./pages/ProjectsManagement";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SidebarLayout />}>
              <Route index element={<Index />} />
              <Route path="documents" element={<Documents />} />
              <Route path="batch-upload" element={<BatchUpload />} />
              <Route path="extraction" element={<Extraction />} />
              <Route path="projects" element={<ProjectsManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
