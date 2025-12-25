import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Hospital from "./pages/Hospital";
import Hotel from "./pages/Hotel";
import Travel from "./pages/Travel";
import Ride from "./pages/Ride";
import Membership from "./pages/Membership";
import Dashboard from "./pages/Dashboard";
import AgentDashboard from "./pages/AgentDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/hospital" element={<Hospital />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/ride" element={<Ride />} />
          <Route path="/membership" element={<Membership />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
