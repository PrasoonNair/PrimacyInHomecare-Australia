import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  MapPin,
  Filter,
  Plus,
  Eye,
  Edit
} from "lucide-react";

interface Shift {
  id: string;
  participantId: string;
  participantName: string;
  assignedStaffId: string;
  staffName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  hourlyRate: number;
  totalAmount: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  shifts: Shift[];
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function CalendarShifts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"month" | "week">("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Filter shifts based on status
  const filteredShifts = shifts.filter(shift => {
    if (statusFilter === "all") return true;
    return shift.status === statusFilter;
  });

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start of calendar (including previous month days)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End of calendar (including next month days)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const calendarDays: CalendarDay[] = [];
    const currentIterDate = new Date(startDate);
    
    while (currentIterDate <= endDate) {
      const dayShifts = filteredShifts.filter(shift => {
        const shiftDate = new Date(shift.shiftDate);
        return shiftDate.toDateString() === currentIterDate.toDateString();
      });
      
      calendarDays.push({
        date: new Date(currentIterDate),
        isCurrentMonth: currentIterDate.getMonth() === month,
        shifts: dayShifts
      });
      
      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }
    
    return calendarDays;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-3 text-blue-600" />
              Shift Calendar
            </h1>
            <p className="text-gray-600 mt-1">Manage and view scheduled shifts</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* View Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewType === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("month")}
                data-testid="button-month-view"
              >
                Month
              </Button>
              <Button
                variant={viewType === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("week")}
                data-testid="button-week-view"
              >
                Week
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h2 className="text-2xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                data-testid="button-next-month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              data-testid="button-today"
            >
              Today
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded-md">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  day.isCurrentMonth 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-100'
                } ${
                  day.date.toDateString() === new Date().toDateString()
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                }`}
                data-testid={`calendar-day-${day.date.getDate()}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* Shifts for this day */}
                <div className="space-y-1">
                  {day.shifts.slice(0, 3).map((shift) => (
                    <div
                      key={shift.id}
                      className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                        statusColors[shift.status as keyof typeof statusColors] || statusColors.pending
                      }`}
                      onClick={() => setSelectedShift(shift)}
                      data-testid={`shift-${shift.id}`}
                    >
                      <div className="font-medium truncate">
                        {formatTime(shift.startTime)} - {shift.participantName}
                      </div>
                      <div className="truncate opacity-75">
                        {shift.staffName}
                      </div>
                    </div>
                  ))}
                  
                  {day.shifts.length > 3 && (
                    <div className="text-xs text-gray-600 font-medium">
                      +{day.shifts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Shift Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedShift.status as keyof typeof statusColors] || statusColors.pending}>
                  {selectedShift.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600">
                  {new Date(selectedShift.shiftDate).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Time and Duration */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-sm text-gray-600">
                          {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-gray-600">{selectedShift.location}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participant and Staff */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      <div>
                        <div className="font-medium">Participant</div>
                        <div className="text-sm text-gray-600">{selectedShift.participantName}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-green-500" />
                      <div>
                        <div className="font-medium">Staff Member</div>
                        <div className="text-sm text-gray-600">{selectedShift.staffName}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Information */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Hourly Rate</div>
                      <div className="text-lg font-semibold text-green-600">
                        ${selectedShift.hourlyRate}/hr
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Total Amount</div>
                      <div className="text-lg font-semibold text-blue-600">
                        ${selectedShift.totalAmount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedShift(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Shift
                </Button>
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold">{filteredShifts.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredShifts.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredShifts.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredShifts.filter(s => s.status === 'scheduled').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}