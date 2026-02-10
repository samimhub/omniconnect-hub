
-- Restaurants linked to hotels
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  opening_time TEXT DEFAULT '09:00',
  closing_time TEXT DEFAULT '23:00',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active restaurants" ON public.restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage restaurants" ON public.restaurants FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Menu categories
CREATE TABLE public.menu_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.menu_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.menu_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Menu items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available items" ON public.menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage items" ON public.menu_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Restaurant tables
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER DEFAULT 4,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tables" ON public.restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tables" ON public.restaurant_tables FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Table bookings
CREATE TABLE public.table_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  guest_count INTEGER DEFAULT 2,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.table_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings" ON public.table_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bookings" ON public.table_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage bookings" ON public.table_bookings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.restaurant_tables(id),
  table_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  total_amount INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  customer_name TEXT,
  user_id UUID,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders by id" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can update order status" ON public.orders FOR UPDATE USING (true);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  item_name TEXT NOT NULL,
  item_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
