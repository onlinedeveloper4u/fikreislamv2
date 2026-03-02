import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.png';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FolderOpen,
  Clock,
  FileText,
  Users,
  BarChart3,
  MessageCircle,
  Home,
  LogOut,
  Shield,
  Tags,
  Mic2,
  Globe,
  Music,
  LayoutGrid,
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { role, signOut } = useAuth();
  const { dir } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';

  const systemItems = [
    { id: 'analytics', title: "تجزیات", icon: BarChart3 },
    { id: 'users', title: "صارفین", icon: Users },
  ];

  const taxonomyItems = [
    { id: 'speakers', title: "مقرر", icon: Mic2 },
    { id: 'languages', title: "زبان", icon: Globe },
    { id: 'audio-types', title: "آڈیو کی قسم", icon: Music },
    { id: 'categories', title: "زمرہ", icon: LayoutGrid },
  ];


  const contentItems = [
    { id: 'content', title: "تمام مواد", icon: FileText },
    { id: 'uploads', title: "شامل کرنے کی صورتحال", icon: Clock },
  ];


  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar collapsible="icon" side={dir === 'rtl' ? 'right' : 'left'}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center px-2 py-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logo} alt="Fikr-e-Islam" className="w-12 h-12 object-contain shrink-0" />
              <div className="flex flex-col">
                <span className="font-display text-sm font-semibold text-sidebar-foreground">
                  {"ڈیش بورڈ"}
                </span>
                <span className="text-xs text-sidebar-foreground/70 capitalize flex items-center gap-1">
                  {"منتظم"}
                </span>
              </div>
            </Link>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:block" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* System & Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>{"تجزیات اور نظام"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={`/admin/${item.id}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Taxonomy Management */}
        <SidebarGroup>
          <SidebarGroupLabel>{"میٹا ڈیٹا اور زمرہ جات"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {taxonomyItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={`/admin/${item.id}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>{"مواد کا انتظام"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    asChild
                    tooltip={item.title}
                  >
                    <Link to={`/admin/${item.id}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={"واپس ہوم پیج پر جائیں"}>
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>{"واپس ہوم پیج پر جائیں"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip={"باہر نکلیں"}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              <span>{"باہر نکلیں"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
