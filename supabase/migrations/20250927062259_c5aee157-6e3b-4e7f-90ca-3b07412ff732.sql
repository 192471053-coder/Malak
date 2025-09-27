-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student');

-- Create users table (extends Supabase auth)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create course enrollments table (many-to-many relationship)
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, course_id, date)
);

-- Create marks table
CREATE TABLE public.marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  grade TEXT,
  exam_type TEXT DEFAULT 'assignment',
  exam_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for courses
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Teachers can manage their courses" ON public.courses
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for course_enrollments
CREATE POLICY "Students can view their enrollments" ON public.course_enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their course enrollments" ON public.course_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage enrollments" ON public.course_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for attendance
CREATE POLICY "Students can view their attendance" ON public.attendance
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage attendance for their courses" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS Policies for marks
CREATE POLICY "Students can view their marks" ON public.marks
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage marks for their courses" ON public.marks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all marks" ON public.marks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marks_updated_at
  BEFORE UPDATE ON public.marks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();