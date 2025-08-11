import { QuickSearchButton } from "@/components/quick-search";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800" data-testid="text-page-title">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600" data-testid="text-page-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <QuickSearchButton />
          <button 
            className="relative p-2 text-gray-600 hover:text-ndis-primary"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 bg-ndis-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face" 
              alt="User profile" 
              className="w-8 h-8 rounded-full object-cover"
              data-testid="img-user-profile"
            />
            <span className="text-sm font-medium text-gray-700" data-testid="text-user-name">
              Sarah Johnson
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-ndis-primary"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
