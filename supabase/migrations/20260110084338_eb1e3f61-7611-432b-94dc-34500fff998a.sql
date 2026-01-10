-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  image_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  beds_count INTEGER DEFAULT 0,
  established_year INTEGER,
  accreditations TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  opening_hours TEXT DEFAULT '24/7',
  is_active BOOLEAN DEFAULT true,
  commission_percentage NUMERIC(4,2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  consultation_fee INTEGER NOT NULL DEFAULT 500,
  image_url TEXT,
  available_days TEXT[] DEFAULT '{"Monday","Tuesday","Wednesday","Thursday","Friday"}',
  available_slots TEXT[] DEFAULT '{"09:00 AM","10:00 AM","11:00 AM","02:00 PM","03:00 PM","04:00 PM"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hospital_services table
CREATE TABLE public.hospital_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;

-- Hospitals RLS policies
CREATE POLICY "Anyone can view active hospitals" 
ON public.hospitals 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hospitals" 
ON public.hospitals 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Departments RLS policies
CREATE POLICY "Anyone can view active departments" 
ON public.departments 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage departments" 
ON public.departments 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Doctors RLS policies
CREATE POLICY "Anyone can view active doctors" 
ON public.doctors 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage doctors" 
ON public.doctors 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Hospital services RLS policies
CREATE POLICY "Anyone can view active services" 
ON public.hospital_services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage services" 
ON public.hospital_services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for hospitals, doctors
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;

-- Create indexes for better performance
CREATE INDEX idx_hospitals_city ON public.hospitals(city);
CREATE INDEX idx_hospitals_state ON public.hospitals(state);
CREATE INDEX idx_hospitals_is_active ON public.hospitals(is_active);
CREATE INDEX idx_doctors_hospital_id ON public.doctors(hospital_id);
CREATE INDEX idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX idx_departments_hospital_id ON public.departments(hospital_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();