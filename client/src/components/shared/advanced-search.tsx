import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  MapPin,
  Clock,
  DollarSign,
  Activity,
  X,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SearchFilter {
  id: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  label: string;
  field: string;
  value: any;
  options?: { label: string; value: string }[];
}

interface SearchResult {
  id: string;
  type: 'participant' | 'staff' | 'service' | 'document' | 'goal';
  title: string;
  subtitle: string;
  description: string;
  metadata: Record<string, any>;
  href: string;
  lastModified?: string;
}

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search/advanced', searchQuery, activeFilters],
    queryFn: async () => {
      if (!searchQuery.trim() && activeFilters.length === 0) return [];
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery);
      
      activeFilters.forEach(filter => {
        if (filter.value !== null && filter.value !== undefined && filter.value !== '') {
          params.set(filter.field, String(filter.value));
        }
      });
      
      const response = await fetch(`/api/search/advanced?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.trim().length > 0 || activeFilters.length > 0
  });

  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    {
      id: 'part-001',
      type: 'participant',
      title: 'Sarah Thompson',
      subtitle: 'NDIS Participant - Plan Review Due',
      description: 'Active participant with autism support needs. Plan review scheduled for next week.',
      metadata: { ndisNumber: '12345678', planValue: '$45,000', caseManager: 'John Smith' },
      href: '/participants/part-001',
      lastModified: '2025-08-29'
    },
    {
      id: 'staff-002',
      type: 'staff',
      title: 'Mike Johnson',
      subtitle: 'Support Worker - Available',
      description: 'Experienced support worker specializing in autism and disability support.',
      metadata: { department: 'Service Delivery', certification: 'Cert IV', availability: 'Full-time' },
      href: '/staff/staff-002',
      lastModified: '2025-08-28'
    },
    {
      id: 'goal-003',
      type: 'goal',
      title: 'Independent Living Skills',
      subtitle: 'Participant Goal - In Progress',
      description: 'Develop cooking and meal preparation skills with weekly 2-hour sessions.',
      metadata: { participant: 'Sarah Thompson', progress: '65%', nextSession: '2025-09-02' },
      href: '/goals/goal-003',
      lastModified: '2025-08-30'
    }
  ];

  const availableFilters: Omit<SearchFilter, 'id' | 'value'>[] = [
    {
      type: 'select',
      label: 'Type',
      field: 'type',
      options: [
        { label: 'Participants', value: 'participant' },
        { label: 'Staff', value: 'staff' },
        { label: 'Services', value: 'service' },
        { label: 'Documents', value: 'document' },
        { label: 'Goals', value: 'goal' }
      ]
    },
    {
      type: 'select',
      label: 'Status',
      field: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' }
      ]
    },
    {
      type: 'select',
      label: 'Department',
      field: 'department',
      options: [
        { label: 'Intake', value: 'intake' },
        { label: 'Service Delivery', value: 'service_delivery' },
        { label: 'HR & Recruitment', value: 'hr_recruitment' },
        { label: 'Finance & Awards', value: 'finance_awards' },
        { label: 'Compliance & Quality', value: 'compliance_quality' }
      ]
    },
    {
      type: 'date',
      label: 'Created After',
      field: 'created_after'
    },
    {
      type: 'date',
      label: 'Modified After',
      field: 'modified_after'
    },
    {
      type: 'select',
      label: 'Location',
      field: 'location',
      options: [
        { label: 'NSW', value: 'nsw' },
        { label: 'VIC', value: 'vic' },
        { label: 'QLD', value: 'qld' },
        { label: 'WA', value: 'wa' },
        { label: 'SA', value: 'sa' },
        { label: 'TAS', value: 'tas' },
        { label: 'ACT', value: 'act' },
        { label: 'NT', value: 'nt' }
      ]
    }
  ];

  const addFilter = (filterTemplate: Omit<SearchFilter, 'id' | 'value'>) => {
    const newFilter: SearchFilter = {
      ...filterTemplate,
      id: `filter-${Date.now()}`,
      value: filterTemplate.type === 'boolean' ? false : ''
    };
    setActiveFilters([...activeFilters, newFilter]);
    setIsFilterDialogOpen(false);
  };

  const updateFilter = (filterId: string, value: any) => {
    setActiveFilters(filters =>
      filters.map(filter =>
        filter.id === filterId ? { ...filter, value } : filter
      )
    );
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(filters => filters.filter(filter => filter.id !== filterId));
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'participant': return <User className="h-4 w-4" />;
      case 'staff': return <User className="h-4 w-4" />;
      case 'service': return <Activity className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'goal': return <Activity className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'participant': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-yellow-100 text-yellow-800';
      case 'goal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const results = searchResults || mockResults;

  return (
    <div className="space-y-6" data-testid="advanced-search">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Advanced Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search participants, staff, goals, documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-advanced-search"
              />
            </div>
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Search Filter</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  {availableFilters
                    .filter(filter => !activeFilters.some(af => af.field === filter.field))
                    .map((filter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => addFilter(filter)}
                      className="justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <div key={filter.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-sm font-medium">{filter.label}:</span>
                    {filter.type === 'select' ? (
                      <Select
                        value={filter.value}
                        onValueChange={(value) => updateFilter(filter.id, value)}
                      >
                        <SelectTrigger className="w-32 h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : filter.type === 'date' ? (
                      <Input
                        type="date"
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, e.target.value)}
                        className="w-32 h-7"
                      />
                    ) : (
                      <Input
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, e.target.value)}
                        className="w-32 h-7"
                        placeholder={`Enter ${filter.label.toLowerCase()}`}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filter.id)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {(searchQuery.trim() || activeFilters.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              {!isLoading && results.length > 0 && (
                <Badge variant="outline">{results.length} results</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = result.href)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <Badge className={getTypeColor(result.type)} variant="outline">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
                        <p className="text-xs text-gray-500 mb-2">{result.description}</p>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                            <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                              {key}: {String(value)}
                            </span>
                          ))}
                          {result.lastModified && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Modified: {result.lastModified}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No results found for your search criteria</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}