import React, { useState } from 'react';
import { Check, Download, Mail, Phone, UserPlus, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface BulkOperationsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  itemType: 'staff' | 'participants';
  onBulkAction: (action: string, data?: any) => Promise<void>;
}

export function BulkOperations({ selectedItems, onClearSelection, itemType, onBulkAction }: BulkOperationsProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsLoading(true);
    try {
      await onBulkAction('export', { format, items: selectedItems });
      toast({
        title: "Export Started",
        description: `Exporting ${selectedItems.length} ${itemType} to ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onBulkAction('email', {
        items: selectedItems,
        subject: emailSubject,
        message: emailMessage
      });
      toast({
        title: "Emails Sent",
        description: `Sent emails to ${selectedItems.length} ${itemType}`,
      });
      setShowEmailDialog(false);
      setEmailSubject('');
      setEmailMessage('');
      onClearSelection();
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: "No Status Selected",
        description: "Please select a new status",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onBulkAction('updateStatus', {
        items: selectedItems,
        status: newStatus
      });
      toast({
        title: "Status Updated",
        description: `Updated status for ${selectedItems.length} ${itemType}`,
      });
      setShowStatusDialog(false);
      setNewStatus('');
      onClearSelection();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      await onBulkAction('delete', { items: selectedItems });
      toast({
        title: "Items Deleted",
        description: `Deleted ${selectedItems.length} ${itemType}`,
      });
      setShowDeleteDialog(false);
      onClearSelection();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedItems.length === 0) return null;

  const statusOptions = itemType === 'staff' 
    ? [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'on_leave', label: 'On Leave' }
      ]
    : [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' }
      ];

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-96" data-testid="bulk-operations-bar">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Check className="h-3 w-3 mr-1" />
              {selectedItems.length} selected
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              data-testid="button-clear-selection"
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading} data-testid="button-export">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Communication */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEmailDialog(true)}
              disabled={isLoading}
              data-testid="button-bulk-email"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>

            {/* Status Update */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStatusDialog(true)}
              disabled={isLoading}
              data-testid="button-bulk-status"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Update Status
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Delete */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
              data-testid="button-bulk-delete"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedItems.length} selected {itemType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject..."
                data-testid="input-email-subject"
              />
            </div>
            
            <div>
              <label htmlFor="email-message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Email message..."
                className="min-h-[120px]"
                data-testid="textarea-email-message"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEmail} disabled={isLoading} data-testid="button-send-email">
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedItems.length} selected {itemType}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger data-testid="select-new-status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isLoading} data-testid="button-update-status">
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Confirm Deletion</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.length} selected {itemType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete} 
              disabled={isLoading}
              data-testid="button-confirm-delete"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}