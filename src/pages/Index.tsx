import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, BarChart3 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Student Management System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform for managing students, courses, attendance, and academic performance. 
              Built for administrators, teachers, and students.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg border bg-card">
              <Users className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground text-sm">
                Manage administrators, teachers, and students with role-based access control.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <BookOpen className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Course Management</h3>
              <p className="text-muted-foreground text-sm">
                Create and manage courses, enroll students, and track academic progress.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <BarChart3 className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground text-sm">
                Generate detailed reports on attendance, performance, and system usage.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>© 2024 Student Management System. Built with Lovable & Supabase.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
