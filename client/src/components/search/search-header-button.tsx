import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Command } from "lucide-react";
import GlobalSearch from "./global-search";

export default function SearchHeaderButton() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop Search Button */}
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 w-64 justify-start text-muted-foreground"
        onClick={() => setSearchOpen(true)}
        data-testid="global-search-trigger"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <div className="ml-auto flex items-center gap-1">
          <Command className="h-3 w-3" />
          <span className="text-xs">K</span>
        </div>
      </Button>

      {/* Mobile Search Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSearchOpen(true)}
        data-testid="mobile-search-trigger"
      >
        <Search className="h-5 w-5" />
      </Button>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}