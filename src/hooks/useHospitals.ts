import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  image_url?: string;
  rating: number;
  reviews_count: number;
  beds_count: number;
  established_year?: number;
  accreditations: string[];
  facilities: string[];
  opening_hours: string;
  is_active: boolean;
  created_at: string;
}

export interface Doctor {
  id: string;
  hospital_id: string;
  department_id?: string;
  name: string;
  specialty: string;
  qualification?: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  consultation_fee: number;
  image_url?: string;
  available_days: string[];
  available_slots: string[];
  is_active: boolean;
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHospitals = useCallback(async (filters?: { city?: string; state?: string; search?: string; specialty?: string }) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('hospitals')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async (filters?: { hospital_id?: string; specialty?: string; search?: string }) => {
    try {
      let query = supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (filters?.hospital_id) {
        query = query.eq('hospital_id', filters.hospital_id);
      }
      if (filters?.specialty) {
        query = query.ilike('specialty', `%${filters.specialty}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,specialty.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const getHospitalDetails = useCallback(async (id: string) => {
    try {
      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (hospitalError) throw hospitalError;

      const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .eq('hospital_id', id)
        .eq('is_active', true);

      const { data: doctors } = await supabase
        .from('doctors')
        .select('*')
        .eq('hospital_id', id)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      const { data: services } = await supabase
        .from('hospital_services')
        .select('*')
        .eq('hospital_id', id)
        .eq('is_active', true);

      return {
        ...hospital,
        departments: departments || [],
        doctors: doctors || [],
        services: services || [],
      };
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();

    // Set up realtime subscription
    const hospitalsChannel = supabase
      .channel('hospitals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospitals' },
        () => {
          fetchHospitals();
        }
      )
      .subscribe();

    const doctorsChannel = supabase
      .channel('doctors-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctors' },
        () => {
          fetchDoctors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(hospitalsChannel);
      supabase.removeChannel(doctorsChannel);
    };
  }, [fetchHospitals, fetchDoctors]);

  return {
    hospitals,
    doctors,
    isLoading,
    fetchHospitals,
    fetchDoctors,
    getHospitalDetails,
  };
}
