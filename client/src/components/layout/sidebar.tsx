import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt" },
    { name: "Participants", href: "/participants", icon: "fas fa-users" },
    { name: "NDIS Plans", href: "/plans", icon: "fas fa-file-alt" },
    { name: "Service Bookings", href: "/services", icon: "fas fa-calendar-check" },
    { name: "Progress Notes", href: "/progress-notes", icon: "fas fa-clipboard-list" },
    { name: "Financials", href: "/financials", icon: "fas fa-dollar-sign" },
    { name: "Staff Management", href: "/staff", icon: "fas fa-user-tie" },
    { name: "Reports", href: "/reports", icon: "fas fa-chart-bar" },
  ];

  const departmentNavigation = [
    { name: "Intake", href: "/intake", icon: "fas fa-user-plus" },
    { name: "HR & Recruitment", href: "/hr-recruitment", icon: "fas fa-user-friends" },
    { name: "Finance & Awards", href: "/finance-awards", icon: "fas fa-coins" },
    { name: "Service Delivery", href: "/service-delivery", icon: "fas fa-truck" },
    { name: "Compliance & Quality", href: "/compliance-quality", icon: "fas fa-shield-alt" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800" data-testid="text-app-title">NDIS Manager</h1>
        <p className="text-sm text-gray-600">Case Management System</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-l-lg transition-colors ${
                isActive(item.href)
                  ? "text-ndis-primary bg-blue-50 border-r-2 border-ndis-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <i className={`${item.icon} mr-3 ${isActive(item.href) ? "text-ndis-primary" : ""}`}></i>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Departments
          </h3>
          <div className="space-y-2">
            {departmentNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-l-lg transition-colors ${
                  isActive(item.href)
                    ? "text-ndis-primary bg-blue-50 border-r-2 border-ndis-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} mr-3 ${isActive(item.href) ? "text-ndis-primary" : ""}`}></i>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
