import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function TeacherDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    todayAttendance: 0,
    avgMarks: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!profile?.id) return;

    try {
      // Fetch teacher's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('teacher_id', profile.id);

      const courseIds = courses?.map(c => c.id) || [];
      const totalCourses = courses?.length || 0;

      if (courseIds.length === 0) {
        setStats({ totalCourses: 0, totalStudents: 0, todayAttendance: 0, avgMarks: 0 });
        return;
      }

      // Fetch enrolled students count
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('student_id')
        .in('course_id', courseIds);

      const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []);
      const totalStudents = uniqueStudents.size;

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendanceData } = await supabase
        .from('attendance')
        .select('status')
        .in('course_id', courseIds)
        .eq('date', today);

      const todayAttendance = todayAttendanceData?.length || 0;

      // Fetch average marks
      const { data: marksData } = await supabase
        .from('marks')
        .select('marks')
        .in('course_id', courseIds);

      const avgMarks = marksData?.length 
        ? Math.round(marksData.reduce((sum, m) => sum + parseFloat(m.marks.toString()), 0) / marksData.length)
        : 0;

      setStats({
        totalCourses,
        totalStudents,
        todayAttendance,
        avgMarks,
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    }
  };

  const statCards = [
    {
      title: "My Courses",
      value: stats.totalCourses,
      description: "Active courses",
      icon: BookOpen,
    },
    {
      title: "My Students",
      value: stats.totalStudents,
      description: "Enrolled students",
      icon: Users,
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      description: "Records marked today",
      icon: Calendar,
    },
    {
      title: "Average Score",
      value: `${stats.avgMarks}%`,
      description: "Class performance",
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
            <CardDescription>Common teaching tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Mark Attendance</h4>
                <p className="text-sm text-muted-foreground">Take attendance for today's classes</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">Add Marks</h4>
                <p className="text-sm text-muted-foreground">Record student grades and scores</p>
              </div>
              <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <h4 className="font-medium">View Reports</h4>
                <p className="text-sm text-muted-foreground">Check class performance analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Mathematics - 101</p>
                  <p className="text-xs text-muted-foreground">9:00 AM - 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Physics - 201</p>
                  <p className="text-xs text-muted-foreground">11:00 AM - 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Chemistry - 301</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - 3:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}