import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboards/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div>Please sign in to access your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-muted-foreground capitalize">
          {profile.role} Dashboard
        </p>
      </div>

      {profile.role === 'admin' && <AdminDashboard />}
      {profile.role === 'teacher' && <TeacherDashboard />}
      {profile.role === 'student' && <StudentDashboard />}
    </div>
  );
}