import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

  const coreNavigation = [
    { name: "Admin Dashboard", href: "/", icon: "fas fa-chart-pie", badge: null, description: "Business Intelligence" },
    { name: "Participants", href: "/participants", icon: "fas fa-users", badge: "247", description: "Active participants" },
    { name: "NDIS Plans", href: "/plans", icon: "fas fa-file-contract", badge: "42", description: "Active plans" },
    { name: "Plan Reader", href: "/plan-reader", icon: "fas fa-brain", badge: "AI", description: "Intelligent plan analysis" },
    { name: "Service Bookings", href: "/services", icon: "fas fa-calendar-check", badge: "28", description: "Today's services" },
    { name: "Progress Notes", href: "/progress-notes", icon: "fas fa-clipboard-list", badge: null, description: "Clinical documentation" },
    { name: "Financials", href: "/financials", icon: "fas fa-dollar-sign", badge: "New", description: "Revenue & invoicing" },
    { name: "Staff Management", href: "/staff", icon: "fas fa-user-tie", badge: "42", description: "Staff & resources" },
    { name: "Automation", href: "/automation", icon: "fas fa-robot", badge: "AI", description: "Efficiency optimization" },
    { name: "Automation Dashboard", href: "/automation-dashboard", icon: "fas fa-tachometer-alt", badge: "Live", description: "KPI & workflow monitoring" },
    { name: "Reports", href: "/reports", icon: "fas fa-chart-bar", badge: "12", description: "Business reports" },
    { name: "Calendar View", href: "/calendar-shifts", icon: "fas fa-calendar-alt", badge: "Live", description: "Visual shift calendar" },
  ];

  const departmentNavigation = [
    { name: "Intake", href: "/intake", icon: "fas fa-user-plus", badge: "3", description: "Referrals & onboarding", status: "active" },
    { name: "HR & Recruitment", href: "/hr-recruitment", icon: "fas fa-user-friends", badge: "5", description: "Staff management", status: "active" },
    { name: "Recruitment Pipeline", href: "/recruitment", icon: "fas fa-briefcase", badge: "New", description: "Hiring workflow", status: "excellent" },
    { name: "Finance & Awards", href: "/finance-awards", icon: "fas fa-coins", badge: "Alert", description: "SCHADS compliance", status: "warning" },
    { name: "Master Agreements", href: "/master-agreements", icon: "fas fa-file-contract", badge: "5", description: "Document management", status: "active" },
    { name: "Service Delivery", href: "/service-delivery", icon: "fas fa-truck", badge: "89%", description: "Operations & allocation", status: "active" },
    { name: "Compliance & Quality", href: "/compliance-quality", icon: "fas fa-shield-alt", badge: "96%", description: "Quality assurance", status: "excellent" },
  ];

  const adminTools = [
    { name: "Role Management", href: "/role-management", icon: "fas fa-user-shield", description: "Create and manage user roles" },
    { name: "Price Guide", href: "/price-guide", icon: "fas fa-tags", description: "NDIS pricing management" },
    { name: "Workflow Management", href: "/workflow-management", icon: "fas fa-project-diagram", description: "Process optimization" },
  ];

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const getBadgeVariant = (status?: string) => {
    switch (status) {
      case 'warning': return 'destructive';
      case 'excellent': return 'success';
      case 'active': return 'default';
      default: return 'secondary';
    }
  };

  const getBadgeColor = (status?: string) => {
    switch (status) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" data-testid="text-app-title">Primacy Care Australia</h1>
            <p className="text-blue-100 text-sm">NDIS Case Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        {/* Core Navigation */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Core Operations
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('core')}
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <i className={`fas fa-chevron-${collapsedSections.core ? 'down' : 'up'} text-xs`}></i>
            </Button>
          </div>
          {!collapsedSections.core && (
            <div className="space-y-1">
              {coreNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <i className={`${item.icon} text-sm`}></i>
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 bg-slate-600 text-slate-200 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Department Navigation */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Departments
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('departments')}
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <i className={`fas fa-chevron-${collapsedSections.departments ? 'down' : 'up'} text-xs`}></i>
            </Button>
          </div>
          {!collapsedSections.departments && (
            <div className="space-y-1">
              {departmentNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      <i className={`${item.icon} text-sm`}></i>
                      {item.status === 'warning' && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                      {item.status === 'excellent' && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`ml-2 text-xs ${getBadgeColor(item.status)}`}>
                    {item.badge}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin Tools */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Admin Tools
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('admin')}
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <i className={`fas fa-chevron-${collapsedSections.admin ? 'down' : 'up'} text-xs`}></i>
            </Button>
          </div>
          {!collapsedSections.admin && (
            <div className="space-y-1">
              {adminTools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <i className={`${item.icon} text-sm`}></i>
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-200">System Status</h4>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-green-400">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span>Performance:</span>
                <span className="text-green-400">Optimal</span>
              </div>
              <div className="flex justify-between">
                <span>Security:</span>
                <span className="text-green-400">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
