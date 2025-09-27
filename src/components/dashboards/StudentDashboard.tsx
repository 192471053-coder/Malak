import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    attendancePercentage: 0,
    averageMarks: 0,
    totalMarks: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.id) return;

    try {
      // Fetch student's enrolled courses
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', profile.id);

      const courseIds = enrollments?.map(e => e.course_id) || [];
      const totalCourses = courseIds.length;

      if (courseIds.length === 0) {
        setStats({ totalCourses: 0, attendancePercentage: 0, averageMarks: 0, totalMarks: 0 });
        return;
      }

      // Fetch attendance data
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', profile.id)
        .in('course_id', courseIds);

      const totalAttendance = attendanceData?.length || 0;
      const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0;
      const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Fetch marks data
      const { data: marksData } = await supabase
        .from('marks')
        .select('marks')
        .eq('student_id', profile.id)
        .in('course_id', courseIds);

      const totalMarks = marksData?.length || 0;
      const averageMarks = marksData?.length 
        ? Math.round(marksData.reduce((sum, m) => sum + parseFloat(m.marks.toString()), 0) / marksData.length)
        : 0;

      setStats({
        totalCourses,
        attendancePercentage,
        averageMarks,
        totalMarks,
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
    }
  };

  const statCards = [
    {
      title: "Enrolled Courses",
      value: stats.totalCourses,
      description: "Active enrollments",
      icon: BookOpen,
    },
    {
      title: "Attendance",
      value: `${stats.attendancePercentage}%`,
      description: "Overall attendance rate",
      icon: Calendar,
    },
    {
      title: "Average Score",
      value: `${stats.averageMarks}%`,
      description: `Based on ${stats.totalMarks} assessments`,
      icon: Trophy,
    },
    {
      title: "Performance",
      value: stats.averageMarks >= 80 ? "Excellent" : stats.averageMarks >= 60 ? "Good" : "Needs Improvement",
      description: "Academic standing",
      icon: TrendingUp,
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
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Common student actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">View Attendance</h4>
                <p className="text-sm text-muted-foreground">Check your attendance history</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Check Marks</h4>
                <p className="text-sm text-muted-foreground">View grades and scores</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Course Materials</h4>
                <p className="text-sm text-muted-foreground">Access study resources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest academic updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Attendance marked</p>
                  <p className="text-xs text-muted-foreground">Mathematics - Today</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">New grade posted</p>
                  <p className="text-xs text-muted-foreground">Physics Assignment - 85%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Course enrolled</p>
                  <p className="text-xs text-muted-foreground">Chemistry 101</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}