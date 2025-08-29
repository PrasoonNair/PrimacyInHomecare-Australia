import { QuickSearchButton } from "@/components/quick-search";
import { TestUserSelector } from "@/components/test-user-selector";
import { QuickActionsMenu } from "@/components/quick-actions-menu";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent" data-testid="text-page-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-600 font-medium mt-1" data-testid="text-page-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {process.env.NODE_ENV === 'development' && <TestUserSelector />}
          <QuickSearchButton />
          <QuickActionsMenu />
          <button 
            className="relative p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
              3
            </span>
          </button>
          <div className="flex items-center space-x-3 bg-gray-50/50 rounded-full px-4 py-2">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face" 
              alt="User profile" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shadow-sm"
              data-testid="img-user-profile"
            />
            <span className="text-sm font-semibold text-gray-800" data-testid="text-user-name">
              Sarah Johnson
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
              data-testid="button-logout"
              title="Sign Out"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
