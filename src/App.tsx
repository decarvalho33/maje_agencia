import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HubProvider } from "@/contexts/HubContext";
import { HubLayout } from "@/components/HubLayout";
import Overview from "./pages/Overview";
import ProcessoCentralPage from "./pages/ProcessoCentralPage";
import CaptacaoPage from "./pages/CaptacaoPage";
import ServicosPage from "./pages/ServicosPage";
import ContratosPage from "./pages/ContratosPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import AtencaoPage from "./pages/AtencaoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HubProvider>
        <BrowserRouter>
          <HubLayout>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/processo" element={<ProcessoCentralPage />} />
              <Route path="/captacao" element={<CaptacaoPage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/atencao" element={<AtencaoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HubLayout>
        </BrowserRouter>
      </HubProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
