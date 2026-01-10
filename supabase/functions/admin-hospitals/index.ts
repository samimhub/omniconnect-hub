import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();
    console.log('Admin hospitals action:', action, data);

    switch (action) {
      case 'list-hospitals': {
        const { search, status } = data || {};
        
        let query = supabase
          .from('hospitals')
          .select(`
            *,
            departments:departments(count),
            doctors:doctors(count)
          `)
          .order('created_at', { ascending: false });

        if (search) {
          query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
        }

        if (status === 'active') {
          query = query.eq('is_active', true);
        } else if (status === 'inactive') {
          query = query.eq('is_active', false);
        }

        const { data: hospitals, error } = await query;

        if (error) {
          console.error('Error fetching hospitals:', error);
          throw error;
        }

        // Transform the count data
        const transformedHospitals = hospitals?.map(hospital => ({
          ...hospital,
          departments_count: hospital.departments?.[0]?.count || 0,
          doctors_count: hospital.doctors?.[0]?.count || 0,
        }));

        return new Response(JSON.stringify({ hospitals: transformedHospitals }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-hospital': {
        const { id } = data;
        
        const { data: hospital, error } = await supabase
          .from('hospitals')
          .select(`
            *,
            departments(*),
            doctors(*),
            hospital_services(*)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching hospital:', error);
          throw error;
        }

        return new Response(JSON.stringify({ hospital }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create-hospital': {
        const { hospital } = data;
        
        const { data: newHospital, error } = await supabase
          .from('hospitals')
          .insert(hospital)
          .select()
          .single();

        if (error) {
          console.error('Error creating hospital:', error);
          throw error;
        }

        console.log('Hospital created:', newHospital.id);
        return new Response(JSON.stringify({ hospital: newHospital }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-hospital': {
        const { id, updates } = data;
        
        const { data: updatedHospital, error } = await supabase
          .from('hospitals')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating hospital:', error);
          throw error;
        }

        console.log('Hospital updated:', id);
        return new Response(JSON.stringify({ hospital: updatedHospital }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-hospital': {
        const { id } = data;
        
        const { error } = await supabase
          .from('hospitals')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting hospital:', error);
          throw error;
        }

        console.log('Hospital deleted:', id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'toggle-hospital-status': {
        const { id, is_active } = data;
        
        const { data: updatedHospital, error } = await supabase
          .from('hospitals')
          .update({ is_active })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error toggling hospital status:', error);
          throw error;
        }

        console.log('Hospital status toggled:', id, is_active);
        return new Response(JSON.stringify({ hospital: updatedHospital }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Department management
      case 'add-department': {
        const { department } = data;
        
        const { data: newDepartment, error } = await supabase
          .from('departments')
          .insert(department)
          .select()
          .single();

        if (error) {
          console.error('Error adding department:', error);
          throw error;
        }

        return new Response(JSON.stringify({ department: newDepartment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-department': {
        const { id, updates } = data;
        
        const { data: updatedDepartment, error } = await supabase
          .from('departments')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating department:', error);
          throw error;
        }

        return new Response(JSON.stringify({ department: updatedDepartment }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-department': {
        const { id } = data;
        
        const { error } = await supabase
          .from('departments')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting department:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Doctor management
      case 'add-doctor': {
        const { doctor } = data;
        
        const { data: newDoctor, error } = await supabase
          .from('doctors')
          .insert(doctor)
          .select()
          .single();

        if (error) {
          console.error('Error adding doctor:', error);
          throw error;
        }

        return new Response(JSON.stringify({ doctor: newDoctor }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-doctor': {
        const { id, updates } = data;
        
        const { data: updatedDoctor, error } = await supabase
          .from('doctors')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating doctor:', error);
          throw error;
        }

        return new Response(JSON.stringify({ doctor: updatedDoctor }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-doctor': {
        const { id } = data;
        
        const { error } = await supabase
          .from('doctors')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting doctor:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Service management
      case 'add-service': {
        const { service } = data;
        
        const { data: newService, error } = await supabase
          .from('hospital_services')
          .insert(service)
          .select()
          .single();

        if (error) {
          console.error('Error adding service:', error);
          throw error;
        }

        return new Response(JSON.stringify({ service: newService }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-service': {
        const { id } = data;
        
        const { error } = await supabase
          .from('hospital_services')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting service:', error);
          throw error;
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    console.error('Admin hospitals error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
