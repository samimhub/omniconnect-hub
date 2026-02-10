import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Restaurant {
  id: string;
  hotel_id: string | null;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  qr_code: string | null;
  status: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  table_number: number;
  status: string;
  total_amount: number;
  notes: string | null;
  customer_name: string | null;
  user_id: string | null;
  payment_status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  notes: string | null;
}

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load restaurants');
    } else {
      setRestaurants((data as any[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  return { restaurants, isLoading, refetch: fetchRestaurants };
};

export const useMenuCategories = (restaurantId: string | null) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order');
    if (!error) setCategories((data as any[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [restaurantId]);

  return { categories, isLoading, refetch: fetchCategories };
};

export const useMenuItems = (restaurantId: string | null) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order');
    if (!error) setItems((data as any[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchItems(); }, [restaurantId]);

  return { items, isLoading, refetch: fetchItems };
};

export const useRestaurantTables = (restaurantId: string | null) => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');
    if (!error) setTables((data as any[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchTables(); }, [restaurantId]);

  return { tables, isLoading, refetch: fetchTables };
};

export const useOrders = (restaurantId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    if (!error) setOrders((data as any[]) || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  // Realtime subscription
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  return { orders, isLoading, refetch: fetchOrders };
};
