import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Users, FileText, Calendar, DollarSign, User, Settings, BarChart3, Bot } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  href: string;
  icon: string;
  badge?: string;
}

interface QuickSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSearch({ open, onOpenChange }: QuickSearchProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch search data
  const { data: participants = [] } = useQuery({
    queryKey: ["/api/participants"],
    enabled: open,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["/api/staff"],
    enabled: open,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["/api/plans"],
    enabled: open,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    enabled: open,
  });

  // Search results based on search term
  const { data: searchResults } = useQuery({
    queryKey: ["/api/search", searchTerm],
    enabled: open && searchTerm.length > 0,
  });

  // Static navigation items
  const navigationItems: SearchResult[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      subtitle: "Business intelligence overview",
      type: "Navigation",
      href: "/",
      icon: "BarChart3",
      badge: "Main"
    },
    {
      id: "participants",
      title: "Participants",
      subtitle: "Manage participant profiles",
      type: "Navigation",
      href: "/participants",
      icon: "Users"
    },
    {
      id: "plans",
      title: "NDIS Plans",
      subtitle: "Plan management and tracking",
      type: "Navigation",
      href: "/plans",
      icon: "FileText"
    },
    {
      id: "services",
      title: "Service Bookings",
      subtitle: "Schedule and manage services",
      type: "Navigation",
      href: "/services",
      icon: "Calendar"
    },
    {
      id: "financials",
      title: "Financials",
      subtitle: "Revenue and invoicing",
      type: "Navigation",
      href: "/financials",
      icon: "DollarSign"
    },
    {
      id: "staff",
      title: "Staff Management",
      subtitle: "Manage staff and resources",
      type: "Navigation",
      href: "/staff",
      icon: "User"
    },
    {
      id: "automation",
      title: "Automation Dashboard",
      subtitle: "AI-powered efficiency optimization",
      type: "Navigation",
      href: "/automation",
      icon: "Bot",
      badge: "AI"
    },
    {
      id: "intake",
      title: "Intake Department",
      subtitle: "Referrals and onboarding",
      type: "Department",
      href: "/intake",
      icon: "Users"
    },
    {
      id: "hr-recruitment",
      title: "HR & Recruitment",
      subtitle: "Staff management and hiring",
      type: "Department",
      href: "/hr-recruitment",
      icon: "User"
    },
    {
      id: "finance-awards",
      title: "Finance & Awards",
      subtitle: "SCHADS compliance and payroll",
      type: "Department",
      href: "/finance-awards",
      icon: "DollarSign"
    },
    {
      id: "service-delivery",
      title: "Service Delivery",
      subtitle: "Operations and allocation",
      type: "Department",
      href: "/service-delivery",
      icon: "Calendar"
    },
    {
      id: "compliance-quality",
      title: "Compliance & Quality",
      subtitle: "Quality assurance and audits",
      type: "Department",
      href: "/compliance-quality",
      icon: "Settings"
    },
    {
      id: "role-management",
      title: "Role Management",
      subtitle: "User roles and permissions",
      type: "Admin",
      href: "/role-management",
      icon: "Settings"
    },
    {
      id: "reports",
      title: "Reports",
      subtitle: "Business analytics and reports",
      type: "Admin",
      href: "/reports",
      icon: "BarChart3"
    }
  ];

  // Convert data to search results - use search results if searching, otherwise show all data
  const dataToUse = searchTerm.length > 0 && searchResults ? searchResults : {
    participants: participants as any[],
    staff: staff as any[],
    plans: plans as any[],
    services: services as any[]
  };

  const participantResults: SearchResult[] = (dataToUse.participants || []).map((p: any) => ({
    id: `participant-${p.id}`,
    title: `${p.firstName} ${p.lastName}`,
    subtitle: `NDIS: ${p.ndisNumber} • ${p.primaryDisability || 'No disability listed'}`,
    type: "Participants",
    href: `/participants/${p.id}`,
    icon: "Users"
  }));

  const staffResults: SearchResult[] = (dataToUse.staff || []).map((s: any) => ({
    id: `staff-${s.id}`,
    title: `${s.firstName} ${s.lastName}`,
    subtitle: `${s.position || 'Staff'} • ${s.email}`,
    type: "Staff",
    href: `/staff/${s.id}`,
    icon: "User"
  }));

  const planResults: SearchResult[] = (dataToUse.plans || []).map((p: any) => ({
    id: `plan-${p.id}`,
    title: `Plan ${p.planNumber}`,
    subtitle: `${p.participantName || 'Unknown Participant'} • $${p.totalBudget || '0'}`,
    type: "Plans",
    href: `/plans/${p.id}`,
    icon: "FileText"
  }));

  const serviceResults: SearchResult[] = (dataToUse.services || []).map((s: any) => ({
    id: `service-${s.id}`,
    title: s.serviceName || s.description || 'Service',
    subtitle: `${s.participantName || 'Unknown'} • ${s.status || 'Unknown status'}`,
    type: "Services",
    href: `/services/${s.id}`,
    icon: "Calendar"
  }));

  // Combine all results
  const allResults = [
    ...navigationItems,
    ...participantResults,
    ...staffResults,
    ...planResults,
    ...serviceResults
  ];

  // Filter navigation results based on search term, but show data results as-is since they're already filtered by backend
  const filteredNavigationResults = searchTerm
    ? navigationItems.filter(result =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : navigationItems;

  const filteredResults = [
    ...filteredNavigationResults,
    ...participantResults,
    ...staffResults,
    ...planResults,
    ...serviceResults
  ];

  // Group results by type
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleSelect = (href: string) => {
    setLocation(href);
    onOpenChange(false);
    setSearchTerm("");
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Users,
      FileText,
      Calendar,
      DollarSign,
      User,
      Settings,
      BarChart3,
      Bot,
      Search
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Search;
    return <IconComponent className="h-4 w-4" />;
  };

  // Keyboard shortcut handling
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search participants, plans, staff, or navigate to any page..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
        data-testid="input-quick-search"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedResults).map(([type, results]) => (
          <CommandGroup key={type} heading={type}>
            {results.slice(0, type === 'Navigation' ? 20 : 5).map((result) => (
              <CommandItem
                key={result.id}
                value={result.title + " " + result.subtitle}
                onSelect={() => handleSelect(result.href)}
                className="flex items-center space-x-3 cursor-pointer"
                data-testid={`search-result-${result.id}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getIcon(result.icon)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{result.title}</span>
                      {result.badge && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {result.badge}
                        </span>
                      )}
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function QuickSearchButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
        data-testid="button-quick-search"
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search everything...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <QuickSearch open={open} onOpenChange={setOpen} />
    </>
  );
}