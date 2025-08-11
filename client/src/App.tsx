import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Participants from "@/pages/participants";
import Plans from "@/pages/plans";
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
// Department pages
import Intake from "@/pages/intake";
import HRRecruitment from "@/pages/hr-recruitment";
import FinanceAwards from "@/pages/finance-awards";
import ServiceDelivery from "@/pages/service-delivery";
import ComplianceQuality from "@/pages/compliance-quality";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/participants" component={Participants} />
          <Route path="/plans" component={Plans} />
          <Route path="/services" component={Services} />
          <Route path="/progress-notes" component={ProgressNotes} />
          <Route path="/financials" component={Financials} />
          <Route path="/staff" component={Staff} />
          <Route path="/reports" component={Reports} />
          <Route path="/role-management" component={RoleManagement} />
          <Route path="/price-guide" component={PriceGuide} />
          <Route path="/automation" component={Automation} />
          {/* Department Routes */}
          <Route path="/intake" component={Intake} />
          <Route path="/hr-recruitment" component={HRRecruitment} />
          <Route path="/finance-awards" component={FinanceAwards} />
          <Route path="/service-delivery" component={ServiceDelivery} />
          <Route path="/compliance-quality" component={ComplianceQuality} />
        </>
      )}
      <Route component={NotFound} />
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
