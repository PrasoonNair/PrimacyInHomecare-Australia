import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, Clock, Plus, FileText, Send, DollarSign,
  Calendar, CheckCircle, BarChart3, Phone, Users,
  MessageSquare, Upload, Download, Settings
} from "lucide-react";

export function QuickActionsMenu() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const quickActions = [
    {
      category: "Common",
      items: [
        { 
          icon: Clock, 
          label: "Clock In/Out", 
          shortcut: "Ctrl+I",
          action: () => {
            toast({ title: "Clocked In", description: "Shift started at 9:00 AM" });
          }
        },
        { 
          icon: Plus, 
          label: "New Participant", 
          shortcut: "Ctrl+N",
          action: () => setLocation("/participants?action=new")
        },
        { 
          icon: FileText, 
          label: "Progress Note", 
          shortcut: "Ctrl+P",
          action: () => setLocation("/progress-notes?action=new")
        },
        { 
          icon: DollarSign, 
          label: "Submit Claim", 
          shortcut: "Ctrl+C",
          action: () => {
            toast({ title: "Claim Submitted", description: "Processing NDIS claim..." });
          }
        }
      ]
    },
    {
      category: "Communication",
      items: [
        { 
          icon: Send, 
          label: "Send SMS", 
          shortcut: "Ctrl+S",
          action: () => {
            toast({ title: "SMS Composer", description: "Opening message window" });
          }
        },
        { 
          icon: MessageSquare, 
          label: "Email Campaign", 
          shortcut: "Ctrl+E",
          action: () => setLocation("/communications?tab=email")
        },
        { 
          icon: Phone, 
          label: "Call Participant", 
          action: () => {
            toast({ title: "Dialing", description: "Connecting call..." });
          }
        }
      ]
    },
    {
      category: "Management",
      items: [
        { 
          icon: Calendar, 
          label: "Schedule Shift", 
          shortcut: "Ctrl+H",
          action: () => setLocation("/shifts?action=schedule")
        },
        { 
          icon: Users, 
          label: "Staff Roster", 
          action: () => setLocation("/staff?view=roster")
        },
        { 
          icon: BarChart3, 
          label: "Generate Report", 
          shortcut: "Ctrl+R",
          action: () => setLocation("/reports")
        },
        { 
          icon: CheckCircle, 
          label: "Approve Requests", 
          action: () => setLocation("/approvals")
        }
      ]
    },
    {
      category: "Data",
      items: [
        { 
          icon: Upload, 
          label: "Bulk Import", 
          action: () => setLocation("/bulk-operations?tab=import")
        },
        { 
          icon: Download, 
          label: "Export Data", 
          action: () => {
            toast({ title: "Export Started", description: "Preparing data download..." });
          }
        }
      ]
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700"
          data-testid="button-quick-actions"
        >
          <Zap className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        {quickActions.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            {categoryIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{category.category}</DropdownMenuLabel>
            {category.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem 
                  key={itemIndex}
                  onClick={item.action}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}