import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PermissionGuard } from "./components/PermissionGuard";
import { SmartRoute } from "./components/SmartRoute";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import Contacts from "./pages/Contacts";
import Campaigns from "./pages/Campaigns";
import Prospects from "./pages/Prospects";
import Attendants from "./pages/Attendants";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import AgentsIA from "./pages/AgentsIA";
import Integrations from "./pages/Integrations";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OrganizationProvider>
          <Toaster />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/autenticacao" element={<Auth />} />
              <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
              <Route path="/planos" element={<Pricing />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/caixa-entrada"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Inbox />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contatos"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SmartRoute permission="canManageContacts">
                      <Contacts />
                    </SmartRoute>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campanhas"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SmartRoute permission="canManageCampaigns">
                      <Campaigns />
                    </SmartRoute>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prospeccao"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SmartRoute permission="canCreateProspects">
                      <Prospects />
                    </SmartRoute>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
        <Route
          path="/atendentes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SmartRoute permission="canManageAttendants">
                  <Attendants />
                </SmartRoute>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SmartRoute permission="canManageCRM">
                  <CRM />
                </SmartRoute>
              </AppLayout>
            </ProtectedRoute>
          }
        />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SmartRoute permission="canManageSettings">
                    <Settings />
                  </SmartRoute>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentes-ia"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SmartRoute permission="canManageAIAgents">
                    <AgentsIA />
                  </SmartRoute>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/integracoes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SmartRoute permission="canManageIntegrations">
                    <Integrations />
                  </SmartRoute>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </OrganizationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
