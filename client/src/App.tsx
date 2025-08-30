import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { getRoleDashboardPath, type UserRole } from "@/lib/roles";
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
import Recruitment from "@/pages/recruitment";
import PlanReader from "@/pages/plan-reader";
import PrivacyPolicy from "@/pages/privacy-policy";
import TestLogin from "@/pages/test-login";
// Department pages
import Intake from "@/pages/intake";
import HRRecruitment from "@/pages/hr-recruitment";
import FinanceAwards from "@/pages/finance-awards";
import ServiceDelivery from "@/pages/service-delivery";
import ShiftManagement from "@/pages/shift-management";
import CalendarShifts from "@/pages/calendar-shifts";
import ComplianceQuality from "@/pages/compliance-quality";
import Incidents from "@/pages/incidents";
// Role-specific dashboards
import SuperAdminDashboard from "@/pages/role-dashboards/super-admin-dashboard";
import CEODashboard from "@/pages/role-dashboards/ceo-dashboard";
import GeneralManagerDashboard from "@/pages/role-dashboards/general-manager-dashboard";
import IntakeCoordinatorDashboard from "@/pages/role-dashboards/intake-coordinator-dashboard";
import FinanceManagerDashboard from "@/pages/role-dashboards/finance-manager-dashboard";
import HRManagerDashboard from "@/pages/role-dashboards/hr-manager-dashboard";
import ServiceDeliveryManagerDashboard from "@/pages/role-dashboards/service-delivery-manager-dashboard";
import QualityManagerDashboard from "@/pages/role-dashboards/quality-manager-dashboard";
import SupportWorkerDashboard from "@/pages/role-dashboards/support-worker-dashboard";
import { ParticipantPortal } from "@/pages/participant-portal";
import { WidgetEmbedPage } from "@/pages/widget-embed-page";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import ParticipantDirectoryPage from "@/pages/participant-directory";
import StaffDirectoryPage from "@/pages/staff-directory";

function AppLayout({ children }: { children: React.ReactNode }) {
  // Enable keyboard shortcuts throughout the app
  useKeyboardShortcuts();
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to role-specific dashboard if at root
  useEffect(() => {
    if (isAuthenticated && user?.role && location === "/") {
      const dashboardPath = getRoleDashboardPath(user.role as UserRole);
      setLocation(dashboardPath);
    }
  }, [isAuthenticated, user, location, setLocation]);

  return (
    <Switch>
      <Route path="/test-login" component={TestLogin} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/participants" component={Participants} />
            <Route path="/participant-directory" component={() => <ParticipantDirectoryPage />} />
            <Route path="/participants/:id" component={React.lazy(() => import('./pages/participants/[id]/index'))} />
            <Route path="/plans/new" component={PlanNew} />
            <Route path="/plans" component={Plans} />
            <Route path="/plan-reader" component={PlanReader} />
            <Route path="/services" component={Services} />
            <Route path="/progress-notes" component={ProgressNotes} />
            <Route path="/financials" component={Financials} />
            <Route path="/staff" component={Staff} />
            <Route path="/staff-directory" component={() => <StaffDirectoryPage />} />
            <Route path="/staff/:id" component={React.lazy(() => import('./pages/staff/[id]/index'))} />
            <Route path="/reports" component={Reports} />
            <Route path="/role-management" component={RoleManagement} />
            <Route path="/price-guide" component={PriceGuide} />
            <Route path="/automation" component={Automation} />
            <Route path="/workflow-management" component={WorkflowManagement} />
            <Route path="/recruitment" component={Recruitment} />
            <Route path="/operations-efficiency" component={() => import('./pages/operations-efficiency').then(m => m.default)} />
            {/* Department Routes */}
            <Route path="/intake" component={Intake} />
            <Route path="/hr-recruitment" component={HRRecruitment} />
            <Route path="/finance-awards" component={FinanceAwards} />
            <Route path="/service-delivery" component={ServiceDelivery} />
            <Route path="/shift-management" component={ShiftManagement} />
          <Route path="/calendar-shifts" component={CalendarShifts} />
            <Route path="/compliance-quality" component={ComplianceQuality} />
            <Route path="/incidents" component={Incidents} />
            <Route path="/participant-portal" component={ParticipantPortal} />
            <Route path="/widget-embed" component={WidgetEmbedPage} />
            {/* Role-specific Dashboard Routes */}
            <Route path="/role-dashboards/super-admin" component={SuperAdminDashboard} />
            <Route path="/role-dashboards/ceo" component={CEODashboard} />
            <Route path="/role-dashboards/general-manager" component={GeneralManagerDashboard} />
            <Route path="/role-dashboards/intake-coordinator" component={IntakeCoordinatorDashboard} />
            <Route path="/role-dashboards/intake-manager" component={IntakeCoordinatorDashboard} />
            <Route path="/role-dashboards/finance-officer-billing" component={FinanceManagerDashboard} />
            <Route path="/role-dashboards/finance-officer-payroll" component={FinanceManagerDashboard} />
            <Route path="/role-dashboards/finance-manager" component={FinanceManagerDashboard} />
            <Route path="/role-dashboards/hr-manager" component={HRManagerDashboard} />
            <Route path="/role-dashboards/hr-recruiter" component={HRManagerDashboard} />
            <Route path="/role-dashboards/service-delivery-manager" component={ServiceDeliveryManagerDashboard} />
            <Route path="/role-dashboards/service-delivery-allocation" component={ServiceDeliveryManagerDashboard} />
            <Route path="/role-dashboards/service-delivery-coordinator" component={ServiceDeliveryManagerDashboard} />
            <Route path="/role-dashboards/quality-manager" component={QualityManagerDashboard} />
            <Route path="/role-dashboards/support-worker" component={SupportWorkerDashboard} />
            <Route path="/privacy" component={PrivacyPolicy} />
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
