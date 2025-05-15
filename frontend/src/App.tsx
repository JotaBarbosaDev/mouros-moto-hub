import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Store from "./pages/Store";
import Bar from "./pages/Bar";
import Contact from "./pages/Contact";
import Members from "./pages/Members";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Scale from "./pages/Scale";
import Inventory from "./pages/Inventory";
import Administration from "./pages/Administration";
import Garage from "./pages/Garage";
import Settings from "./pages/Settings";
import SystemSettings from "./pages/SystemSettings";
import MemberCotas from "./pages/MemberCotas";
import BarManagement from "./pages/Bar";
import MemberStore from "./pages/MemberStore";
import Products from "./pages/Products";
import ActivityHistoryPage from "./pages/ActivityHistoryPage";
import LogsSetup from "./pages/LogsSetup";
import Calendar from "./pages/Calendar";
import Treasury from "./pages/Treasury";
import ApiDocs from "./pages/ApiDocs";

const queryClient = new QueryClient();

import { SystemInitializerBasic } from './components/system/SystemInitializerBasic';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SystemInitializerBasic />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/loja" element={<Store />} />
          <Route path="/bar" element={<Bar />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/membros" element={<Members />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/escala" 
            element={
              <ProtectedRoute>
                <Scale />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/administracao" 
            element={
              <ProtectedRoute>
                <Administration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/garagem" 
            element={
              <ProtectedRoute>
                <Garage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sistema" 
            element={
              <AdminRoute>
                <SystemSettings />
              </AdminRoute>
            } 
          />
          <Route 
            path="/cotas" 
            element={
              <ProtectedRoute>
                <MemberCotas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bar-management" 
            element={
              <ProtectedRoute>
                <BarManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/produtos" 
            element={
              <ProtectedRoute>
                <MemberStore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/historico" 
            element={
              <ProtectedRoute>
                <ActivityHistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/logs-setup" 
            element={
              <AdminRoute>
                <LogsSetup />
              </AdminRoute>
            } 
          />
          <Route 
            path="/calendario" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tesouraria" 
            element={
              <ProtectedRoute>
                <Treasury />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/api-docs" 
            element={
              <ProtectedRoute>
                <ApiDocs />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
