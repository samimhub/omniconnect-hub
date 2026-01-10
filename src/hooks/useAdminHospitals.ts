import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  commission_percentage: number;
  created_at: string;
  updated_at: string;
  departments_count?: number;
  doctors_count?: number;
  departments?: Department[];
  doctors?: Doctor[];
  hospital_services?: HospitalService[];
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  description?: string;
  icon?: string;
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
  created_at: string;
}

export interface HospitalService {
  id: string;
  hospital_id: string;
  name: string;
  description?: string;
  price?: number;
  is_active: boolean;
  created_at: string;
}

export function useAdminHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const fetchHospitals = useCallback(async (search?: string, status?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'list-hospitals', data: { search, status } }
      });

      if (error) throw error;
      setHospitals(data.hospitals || []);
    } catch (error: any) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch hospitals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHospital = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'get-hospital', data: { id } }
      });

      if (error) throw error;
      setSelectedHospital(data.hospital);
      return data.hospital;
    } catch (error: any) {
      console.error('Error fetching hospital:', error);
      toast.error('Failed to fetch hospital details');
      return null;
    }
  }, []);

  const createHospital = useCallback(async (hospital: Partial<Hospital>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'create-hospital', data: { hospital } }
      });

      if (error) throw error;
      toast.success('Hospital created successfully');
      await fetchHospitals();
      return data.hospital;
    } catch (error: any) {
      console.error('Error creating hospital:', error);
      toast.error('Failed to create hospital');
      return null;
    }
  }, [fetchHospitals]);

  const updateHospital = useCallback(async (id: string, updates: Partial<Hospital>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'update-hospital', data: { id, updates } }
      });

      if (error) throw error;
      toast.success('Hospital updated successfully');
      await fetchHospitals();
      return data.hospital;
    } catch (error: any) {
      console.error('Error updating hospital:', error);
      toast.error('Failed to update hospital');
      return null;
    }
  }, [fetchHospitals]);

  const deleteHospital = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'delete-hospital', data: { id } }
      });

      if (error) throw error;
      toast.success('Hospital deleted successfully');
      await fetchHospitals();
      return true;
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      toast.error('Failed to delete hospital');
      return false;
    }
  }, [fetchHospitals]);

  const toggleHospitalStatus = useCallback(async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'toggle-hospital-status', data: { id, is_active } }
      });

      if (error) throw error;
      toast.success(`Hospital ${is_active ? 'activated' : 'deactivated'} successfully`);
      await fetchHospitals();
      return true;
    } catch (error: any) {
      console.error('Error toggling hospital status:', error);
      toast.error('Failed to update hospital status');
      return false;
    }
  }, [fetchHospitals]);

  // Department operations
  const addDepartment = useCallback(async (department: Partial<Department>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'add-department', data: { department } }
      });

      if (error) throw error;
      toast.success('Department added successfully');
      return data.department;
    } catch (error: any) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department');
      return null;
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, updates: Partial<Department>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'update-department', data: { id, updates } }
      });

      if (error) throw error;
      toast.success('Department updated successfully');
      return data.department;
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
      return null;
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'delete-department', data: { id } }
      });

      if (error) throw error;
      toast.success('Department deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
      return false;
    }
  }, []);

  // Doctor operations
  const addDoctor = useCallback(async (doctor: Partial<Doctor>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'add-doctor', data: { doctor } }
      });

      if (error) throw error;
      toast.success('Doctor added successfully');
      return data.doctor;
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
      return null;
    }
  }, []);

  const updateDoctor = useCallback(async (id: string, updates: Partial<Doctor>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'update-doctor', data: { id, updates } }
      });

      if (error) throw error;
      toast.success('Doctor updated successfully');
      return data.doctor;
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor');
      return null;
    }
  }, []);

  const deleteDoctor = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'delete-doctor', data: { id } }
      });

      if (error) throw error;
      toast.success('Doctor deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
      return false;
    }
  }, []);

  // Service operations
  const addService = useCallback(async (service: Partial<HospitalService>) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'add-service', data: { service } }
      });

      if (error) throw error;
      toast.success('Service added successfully');
      return data.service;
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
      return null;
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-hospitals', {
        body: { action: 'delete-service', data: { id } }
      });

      if (error) throw error;
      toast.success('Service deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return {
    hospitals,
    isLoading,
    selectedHospital,
    setSelectedHospital,
    fetchHospitals,
    getHospital,
    createHospital,
    updateHospital,
    deleteHospital,
    toggleHospitalStatus,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addService,
    deleteService,
  };
}
