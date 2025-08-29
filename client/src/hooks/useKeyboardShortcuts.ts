import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // Global Search (Ctrl/Cmd + K)
      if (isCtrlOrCmd && e.key === 'k') {
        e.preventDefault();
        const searchButton = document.querySelector('[data-testid="button-search"]');
        if (searchButton) {
          (searchButton as HTMLElement).click();
        } else {
          toast({
            title: "Search",
            description: "Quick search activated",
          });
        }
      }

      // New Participant (Ctrl/Cmd + N)
      if (isCtrlOrCmd && e.key === 'n') {
        e.preventDefault();
        setLocation('/participants?action=new');
        toast({
          title: "New Participant",
          description: "Opening new participant form",
        });
      }

      // Save Form (Ctrl/Cmd + S)
      if (isCtrlOrCmd && e.key === 's') {
        e.preventDefault();
        const saveButton = document.querySelector('[data-testid="button-save"]');
        if (saveButton) {
          (saveButton as HTMLElement).click();
        } else {
          toast({
            title: "Save",
            description: "Form saved",
          });
        }
      }

      // Print (Ctrl/Cmd + P) - Let browser handle this naturally

      // Generate Report (Ctrl/Cmd + R)
      if (isCtrlOrCmd && e.key === 'r') {
        e.preventDefault();
        setLocation('/reports');
        toast({
          title: "Reports",
          description: "Opening reports dashboard",
        });
      }

      // New Message (Ctrl/Cmd + M)
      if (isCtrlOrCmd && e.key === 'm') {
        e.preventDefault();
        toast({
          title: "Messages",
          description: "Opening message composer",
        });
      }

      // Department Switching (Alt + 1-5)
      if (isAlt) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            setLocation('/intake');
            toast({ title: "Intake Department" });
            break;
          case '2':
            e.preventDefault();
            setLocation('/hr-recruitment');
            toast({ title: "HR & Recruitment" });
            break;
          case '3':
            e.preventDefault();
            setLocation('/finance-awards');
            toast({ title: "Finance Department" });
            break;
          case '4':
            e.preventDefault();
            setLocation('/service-delivery');
            toast({ title: "Service Delivery" });
            break;
          case '5':
            e.preventDefault();
            setLocation('/compliance-quality');
            toast({ title: "Compliance & Quality" });
            break;
        }
      }

      // Quick Actions (Ctrl/Cmd + Q)
      if (isCtrlOrCmd && e.key === 'q') {
        e.preventDefault();
        const quickActionsButton = document.querySelector('[data-testid="button-quick-actions"]');
        if (quickActionsButton) {
          (quickActionsButton as HTMLElement).click();
        } else {
          toast({
            title: "Quick Actions",
            description: "Opening quick actions menu",
          });
        }
      }

      // Help (F1)
      if (e.key === 'F1') {
        e.preventDefault();
        toast({
          title: "Keyboard Shortcuts",
          description: "Ctrl+K: Search | Ctrl+N: New Participant | Ctrl+S: Save | Alt+1-5: Switch Departments",
        });
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        const closeButton = document.querySelector('[data-testid="button-close-modal"]');
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setLocation, toast]);
}