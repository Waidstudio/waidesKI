import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Analysis from "./pages/Analysis.tsx";
import Markets from "./pages/Markets.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import Konsmia from "./pages/Konsmia.tsx";
import Settings from "./pages/Settings.tsx";
import Chat from "./pages/Chat.tsx";
import Signals from "./pages/Signals.tsx";
import Predictions from "./pages/Predictions.tsx";
import Journal from "./pages/Journal.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import KonsAi from "./pages/KonsAi.tsx";
import SmaiChinnikstah from "./pages/SmaiChinnikstah.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/signals" element={<Signals />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/konsai" element={<KonsAi />} />
              <Route path="/konsmia" element={<Konsmia />} />
              <Route path="/chinnikstah" element={<SmaiChinnikstah />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
