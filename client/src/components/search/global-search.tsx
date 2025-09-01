import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SearchIcon,
  UserIcon,
  UsersIcon,
  FileTextIcon,
  CalendarIcon,
  CreditCardIcon,
  ClipboardListIcon,
  SettingsIcon,
  TrendingUpIcon,
  ZapIcon,
  FolderIcon,
  ShieldIcon,
  BriefcaseIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightIcon,
  StarIcon,
  HistoryIcon,
  CommandIcon,
  CheckIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useLocation } from "wouter";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  action?: string;
  icon?: string;
  badge?: string;
  relevanceScore: number;
  category: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url?: string;
  action?: () => void;
  shortcut?: string;
  category: string;
  roles: string[];
}

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleBasedQuickActions: QuickAction[] = [
  // Universal Actions
  {
    id: "new-participant",
    title: "Add New Participant",
    description: "Register a new NDIS participant",
    icon: "UserIcon",
    url: "/participants/new",
    shortcut: "Ctrl+P",
    category: "Participants",
    roles: ["all"]
  },
  {
    id: "new-plan",
    title: "Upload NDIS Plan",
    description: "Upload and analyze new NDIS plan",
    icon: "FileTextIcon",
    url: "/plans/new",
    shortcut: "Ctrl+U",
    category: "Plans",
    roles: ["all"]
  },
  {
    id: "book-service",
    title: "Book Service",
    description: "Schedule a new service booking",
    icon: "CalendarIcon",
    url: "/services/new",
    shortcut: "Ctrl+B",
    category: "Services",
    roles: ["all"]
  },
  {
    id: "add-progress-note",
    title: "Add Progress Note",
    description: "Document participant progress",
    icon: "ClipboardListIcon",
    url: "/progress-notes/new",
    shortcut: "Ctrl+N",
    category: "Documentation",
    roles: ["all"]
  },

  // Intake Coordinator
  {
    id: "process-referral",
    title: "Process Referral",
    description: "Handle incoming referral",
    icon: "UserIcon",
    url: "/intake/referrals/new",
    category: "Intake",
    roles: ["intake-coordinator", "intake-manager"]
  },
  {
    id: "verify-documents",
    title: "Verify Documents",
    description: "Review and verify participant documents",
    icon: "ShieldIcon",
    url: "/intake/verification",
    category: "Intake",
    roles: ["intake-coordinator", "intake-manager"]
  },
  {
    id: "eligibility-check",
    title: "NDIS Eligibility Check", 
    description: "Verify NDIS eligibility status",
    icon: "ShieldIcon",
    url: "/intake/eligibility",
    category: "Intake",
    roles: ["intake-coordinator", "intake-manager"]
  },

  // Finance Manager
  {
    id: "generate-invoice",
    title: "Generate Invoice",
    description: "Create participant invoice",
    icon: "CreditCardIcon",
    url: "/financials/invoices/new",
    category: "Finance",
    roles: ["finance-manager", "finance-officer-billing"]
  },
  {
    id: "travel-calculator",
    title: "Calculate Travel",
    description: "Calculate provider travel costs",
    icon: "MapPinIcon",
    url: "/finance-awards?tab=travel",
    category: "Finance",
    roles: ["finance-manager", "finance-officer-billing", "finance-officer-payroll"]
  },
  {
    id: "process-payroll",
    title: "Process Payroll",
    description: "Calculate staff payroll",
    icon: "CreditCardIcon",
    url: "/finance-awards?tab=payroll",
    category: "Finance",
    roles: ["finance-manager", "finance-officer-payroll"]
  },
  {
    id: "view-master-agreements",
    title: "Master Agreements",
    description: "Manage reference documents",
    icon: "FolderIcon",
    url: "/master-agreements",
    category: "Finance",
    roles: ["finance-manager", "finance-officer-billing"]
  },

  // HR Manager
  {
    id: "add-staff",
    title: "Add Staff Member",
    description: "Onboard new staff member",
    icon: "UserIcon",
    url: "/staff/new",
    category: "HR",
    roles: ["hr-manager", "hr-recruiter"]
  },
  {
    id: "job-posting",
    title: "Create Job Posting",
    description: "Post new job opening",
    icon: "BriefcaseIcon",
    url: "/hr-recruitment/jobs/new",
    category: "HR",
    roles: ["hr-manager", "hr-recruiter"]
  },
  {
    id: "staff-availability",
    title: "Manage Availability",
    description: "Update staff availability",
    icon: "CalendarIcon",
    url: "/staff/availability",
    category: "HR",
    roles: ["hr-manager"]
  },
  {
    id: "staff-directory",
    title: "Staff Directory",
    description: "View all staff members",
    icon: "UsersIcon",
    url: "/staff-directory",
    category: "HR",
    roles: ["hr-manager", "hr-recruiter"]
  },

  // Service Delivery Manager
  {
    id: "service-allocation",
    title: "Allocate Services",
    description: "Assign services to staff",
    icon: "UsersIcon",
    url: "/service-delivery/allocation",
    category: "Service Delivery",
    roles: ["service-delivery-manager", "service-delivery-coordinator"]
  },
  {
    id: "create-agreement",
    title: "Service Agreement",
    description: "Create new service agreement",
    icon: "FileTextIcon",
    url: "/service-delivery/agreements/new",
    category: "Service Delivery",
    roles: ["service-delivery-manager", "service-delivery-coordinator"]
  },
  {
    id: "shift-management",
    title: "Manage Shifts",
    description: "Schedule and manage shifts",
    icon: "ClockIcon",
    url: "/shift-management",
    category: "Service Delivery",
    roles: ["service-delivery-manager", "service-delivery-coordinator"]
  },

  // Quality Manager
  {
    id: "incident-report",
    title: "Report Incident",
    description: "Create incident report", 
    icon: "ShieldIcon",
    url: "/incidents/new",
    category: "Quality",
    roles: ["quality-manager", "compliance-quality"]
  },
  {
    id: "audit-checklist",
    title: "Compliance Audit",
    description: "Perform compliance audit",
    icon: "ShieldIcon",
    url: "/compliance-quality/audit",
    category: "Quality",
    roles: ["quality-manager", "compliance-quality"]
  },
  {
    id: "automation-dashboard",
    title: "Automation Dashboard",
    description: "Monitor KPIs and automations",
    icon: "ZapIcon",
    url: "/automation-dashboard",
    category: "Quality",
    roles: ["quality-manager", "super-admin", "ceo", "general-manager"]
  },

  // Support Worker
  {
    id: "clock-in",
    title: "Clock In",
    description: "Start shift time tracking",
    icon: "ClockIcon",
    url: "/clock-in",
    action: () => executeAction("clock-in"),
    category: "Shifts",
    roles: ["support-worker"]
  },
  {
    id: "clock-out",
    title: "Clock Out",
    description: "End shift and submit notes",
    icon: "ClockIcon",
    url: "/clock-out",
    action: () => executeAction("clock-out"),
    category: "Shifts",
    roles: ["support-worker"]
  },
  {
    id: "emergency-contact",
    title: "Emergency Contacts",
    description: "View emergency contact list",
    icon: "PhoneIcon",
    url: "/emergency-contacts",
    category: "Emergency",
    roles: ["support-worker"]
  },

  // Admin Functions
  {
    id: "system-settings",
    title: "System Settings",
    description: "Configure system preferences",
    icon: "SettingsIcon",
    url: "/settings",
    category: "Admin",
    roles: ["super-admin", "ceo"]
  },
  {
    id: "role-management",
    title: "Role Management",
    description: "Manage user roles and permissions",
    icon: "ShieldIcon",
    url: "/role-management",
    category: "Admin",
    roles: ["super-admin", "ceo", "general-manager"]
  },
  {
    id: "reports-dashboard",
    title: "Business Reports",
    description: "View comprehensive reports",
    icon: "TrendingUpIcon",
    url: "/reports",
    category: "Admin",
    roles: ["super-admin", "ceo", "general-manager", "finance-manager"]
  }
];

export default function GlobalSearch({ isOpen, onClose }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: searchResults = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", searchQuery, user?.role],
    enabled: searchQuery.length > 2,
  });

  const executeAction = async (action: string) => {
    switch (action) {
      case 'clock-in':
        await apiRequest('/api/shifts/clock-in', { method: 'POST' });
        break;
      case 'clock-out':
        await apiRequest('/api/shifts/clock-out', { method: 'POST' });
        break;
    }
  };

  const getFilteredQuickActions = useCallback(() => {
    if (!user?.role) return [];
    
    return roleBasedQuickActions.filter(action => 
      action.roles.includes("all") || action.roles.includes(user.role)
    );
  }, [user?.role]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < (searchResults.length + getFilteredQuickActions().length - 1) ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length + getFilteredQuickActions().length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        handleSelection();
        break;
    }
  }, [isOpen, searchResults, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelection = async () => {
    const allItems = [...searchResults, ...getFilteredQuickActions()];
    const selectedItem = allItems[selectedIndex];

    if (selectedItem) {
      if ('url' in selectedItem && selectedItem.url) {
        setLocation(selectedItem.url);
        addToHistory(searchQuery || selectedItem.title);
      } else if ('action' in selectedItem && selectedItem.action) {
        if (typeof selectedItem.action === 'function') {
          selectedItem.action();
        } else if (typeof selectedItem.action === 'string') {
          await executeAction(selectedItem.action);
        }
      }
      onClose();
    }
  };

  const addToHistory = (query: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      UserIcon,
      UsersIcon,
      FileTextIcon,
      CalendarIcon,
      CreditCardIcon,
      ClipboardListIcon,
      SettingsIcon,
      TrendingUpIcon,
      ZapIcon,
      FolderIcon,
      ShieldIcon,
      BriefcaseIcon,
      ClockIcon,
      MapPinIcon,
      PhoneIcon
    };
    const IconComponent = iconMap[iconName] || SearchIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  const groupedActions = getFilteredQuickActions().reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Quick Search & Actions
            <Badge variant="outline" className="ml-auto">
              <CommandIcon className="h-3 w-3 mr-1" />
              K
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0">
          <Input
            placeholder={`Search ${user?.role ? `(${user.role.replace('-', ' ')})` : ''}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            autoFocus
            data-testid="global-search-input"
          />
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-4 pt-0 space-y-4">
            
            {/* Search Results */}
            {searchQuery.length > 2 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  Search Results
                </h3>
                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => {
                          setSelectedIndex(index);
                          handleSelection();
                        }}
                        data-testid={`search-result-${result.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {getItemIcon(result.icon || 'SearchIcon')}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{result.title}</span>
                              {result.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {result.badge}
                                </Badge>
                              )}
                            </div>
                            {result.subtitle && (
                              <div className="text-sm text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(result.id);
                            }}
                          >
                            <StarIcon className={`h-3 w-3 ${favorites.includes(result.id) ? 'fill-current' : ''}`} />
                          </Button>
                          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}

            {searchQuery.length <= 2 && (
              <>
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <HistoryIcon className="h-4 w-4" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 5).map((query, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => setSearchQuery(query)}
                          data-testid={`recent-search-${index}`}
                        >
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions by Category */}
                {Object.entries(groupedActions).map(([category, actions]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {actions.map((action, actionIndex) => {
                        const globalIndex = searchResults.length + 
                          Object.entries(groupedActions)
                            .slice(0, Object.keys(groupedActions).indexOf(category))
                            .reduce((acc, [, acts]) => acc + acts.length, 0) + actionIndex;
                        
                        return (
                          <div
                            key={action.id}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              globalIndex === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => {
                              setSelectedIndex(globalIndex);
                              handleSelection();
                            }}
                            data-testid={`quick-action-${action.id}`}
                          >
                            <div className="flex items-center gap-3">
                              {getItemIcon(action.icon)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{action.title}</span>
                                  {action.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                      {action.shortcut}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {action.description}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(action.id);
                                }}
                              >
                                <StarIcon className={`h-3 w-3 ${favorites.includes(action.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="p-3 text-xs text-muted-foreground flex justify-between">
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          <span>{getFilteredQuickActions().length} actions available</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}