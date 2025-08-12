import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Participants from "@/pages/participants";
import Plans from "@/pages/plans";
import PlanNew from "@/pages/plan-new";
import Services from "@/pages/services";
import ProgressNotes from "@/pages/progress-notes";
import Financials from "@/pages/financials";
import Staff from "@/pages/staff";
import Reports from "@/pages/reports";
import RoleManagement from "@/pages/role-management";
import PriceGuide from "@/pages/price-guide";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Automation from "@/pages/automation";
import WorkflowManagement from "@/pages/workflow-management";
import PlanReader from "@/pages/plan-reader";
// Department pages
import Intake from "@/pages/intake";
import HRRecruitment from "@/pages/hr-recruitment";
import FinanceAwards from "@/pages/finance-awards";
import ServiceDelivery from "@/pages/service-delivery";
import ShiftManagement from "@/pages/shift-management";
import ComplianceQuality from "@/pages/compliance-quality";
import Incidents from "@/pages/incidents";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Primacy Care Australia CMS" subtitle="Comprehensive NDIS case management system" />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/participants" component={Participants} />
            <Route path="/plans/new" component={PlanNew} />
            <Route path="/plans" component={Plans} />
            <Route path="/plan-reader" component={PlanReader} />
            <Route path="/services" component={Services} />
            <Route path="/progress-notes" component={ProgressNotes} />
            <Route path="/financials" component={Financials} />
            <Route path="/staff" component={Staff} />
            <Route path="/reports" component={Reports} />
            <Route path="/role-management" component={RoleManagement} />
            <Route path="/price-guide" component={PriceGuide} />
            <Route path="/automation" component={Automation} />
            <Route path="/workflow-management" component={WorkflowManagement} />
            {/* Department Routes */}
            <Route path="/intake" component={Intake} />
            <Route path="/hr-recruitment" component={HRRecruitment} />
            <Route path="/finance-awards" component={FinanceAwards} />
            <Route path="/service-delivery" component={ServiceDelivery} />
            <Route path="/shift-management" component={ShiftManagement} />
            <Route path="/compliance-quality" component={ComplianceQuality} />
            <Route path="/incidents" component={Incidents} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
