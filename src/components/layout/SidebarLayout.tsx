
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Home,
  Menu,
  Settings,
  Database,
  FolderPlus,
  Briefcase,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    workflow: true,
    organization: true,
    configuration: true
  });
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  
  const navigationGroups = [
    {
      id: 'workflow',
      label: 'Document Workflow',
      items: [
        { path: "/", label: "Home", icon: Home },
        { path: "/documents", label: "Documents", icon: FileText },
        { path: "/batch-upload", label: "Batch Upload", icon: FolderPlus },
        { path: "/extraction", label: "Data Extraction", icon: Database },
      ]
    },
    {
      id: 'organization',
      label: 'Organization',
      items: [
        { path: "/projects", label: "Projects", icon: Briefcase },
      ]
    },
    {
      id: 'configuration',
      label: 'Configuration',
      items: [
        { path: "/prompts", label: "Prompts", icon: MessageSquare },
        { path: "/settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Filter navigation items based on search query
  const getFilteredNavigation = () => {
    if (!searchQuery) return navigationGroups;
    
    return navigationGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  };

  const filteredNavigation = getFilteredNavigation();

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
          "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transform transition-transform duration-200 ease-in-out",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "sm:translate-x-0 sm:static sm:z-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Layout size={18} />
            DocuAnalyzer
          </h1>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={toggleSidebar} 
            className="sm:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <nav className="py-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {filteredNavigation.map((group) => (
            <div key={group.id} className="mb-3">
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-600"
              >
                {group.label}
                {expandedGroups[group.id as keyof typeof expandedGroups] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              
              {expandedGroups[group.id as keyof typeof expandedGroups] && (
                <div className="mt-1 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link 
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-6 py-2 text-sm transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
