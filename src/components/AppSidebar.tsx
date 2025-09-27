import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  UserCog,
  ClipboardCheck,
  Trophy,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ];

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { title: "Users", url: "/users", icon: Users },
        { title: "Courses", url: "/courses", icon: BookOpen },
        { title: "Attendance", url: "/attendance", icon: Calendar },
        { title: "Marks", url: "/marks", icon: Trophy },
        { title: "Reports", url: "/reports", icon: BarChart3 },
        { title: "Settings", url: "/settings", icon: Settings },
      ];
    }

    if (profile?.role === 'teacher') {
      return [
        ...baseItems,
        { title: "My Courses", url: "/my-courses", icon: BookOpen },
        { title: "Take Attendance", url: "/take-attendance", icon: ClipboardCheck },
        { title: "Manage Marks", url: "/manage-marks", icon: Trophy },
        { title: "My Students", url: "/my-students", icon: Users },
        { title: "Reports", url: "/teacher-reports", icon: BarChart3 },
        { title: "Profile", url: "/profile", icon: UserCog },
      ];
    }

    if (profile?.role === 'student') {
      return [
        ...baseItems,
        { title: "My Courses", url: "/student-courses", icon: GraduationCap },
        { title: "My Attendance", url: "/my-attendance", icon: Calendar },
        { title: "My Marks", url: "/my-marks", icon: Trophy },
        { title: "Profile", url: "/profile", icon: UserCog },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();
  const isExpanded = menuItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={open ? "w-60" : "w-14"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {profile?.role ? `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Panel` : 'Menu'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}