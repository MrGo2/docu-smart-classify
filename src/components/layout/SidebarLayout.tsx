
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Home,
  Menu,
  Settings,
  Database,
  FolderPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/documents", label: "Documents", icon: FileText },
    { path: "/batch-upload", label: "Batch Upload", icon: FolderPlus },
    { path: "/extraction", label: "Data Extraction", icon: Database },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Navbar */}
      <div className="sm:hidden p-4 border-b fixed top-0 w-full bg-white z-40 flex justify-between items-center">
        <h1 className="text-xl font-bold">DocuAnalyzer</h1>
        <Button size="icon" variant="ghost" onClick={toggleSidebar}>
          <Menu size={20} />
        </Button>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar for all screens */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0 sm:static sm:z-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold">DocuAnalyzer</h1>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={toggleSidebar} 
            className="sm:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Content Padding for Mobile */}
        <div className="sm:hidden h-16" />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
