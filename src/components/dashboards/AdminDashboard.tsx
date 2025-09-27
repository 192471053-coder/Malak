import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalAttendance: 0,
    avgAttendance: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      const totalUsers = profiles?.length || 0;
      const totalStudents = profiles?.filter(p => p.role === 'student').length || 0;
      const totalTeachers = profiles?.filter(p => p.role === 'teacher').length || 0;

      // Fetch course count
      const { data: courses } = await supabase
        .from('courses')
        .select('id');
      
      const totalCourses = courses?.length || 0;

      // Fetch attendance stats
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status');

      const totalAttendance = attendance?.length || 0;
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
      const avgAttendance = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      setStats({
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalAttendance,
        avgAttendance: Math.round(avgAttendance),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.totalStudents} Students, ${stats.totalTeachers} Teachers`,
      icon: Users,
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      description: "Active courses",
      icon: BookOpen,
    },
    {
      title: "Attendance Records",
      value: stats.totalAttendance,
      description: `${stats.avgAttendance}% average attendance`,
      icon: Calendar,
    },
    {
      title: "System Status",
      value: "Active",
      description: "All systems operational",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Add New User</h4>
                <p className="text-sm text-muted-foreground">Create student or teacher accounts</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Create Course</h4>
                <p className="text-sm text-muted-foreground">Set up new courses and assignments</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Generate Reports</h4>
                <p className="text-sm text-muted-foreground">View attendance and performance reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">System backup completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New course created</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">User registration</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}