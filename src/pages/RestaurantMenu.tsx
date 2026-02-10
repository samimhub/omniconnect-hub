import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  UtensilsCrossed, Search, ShoppingCart, Plus, Minus, ChefHat,
  Loader2, Clock, CheckCircle2, Flame, Leaf, Send, X,
} from "lucide-react";
import { toast } from "sonner";
import type { Restaurant, MenuCategory, MenuItem } from "@/hooks/useRestaurant";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = parseInt(searchParams.get("table") || "0");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) return;
      setLoading(true);
      const [restRes, catRes, itemRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle(),
        supabase.from('menu_categories').select('*').eq('restaurant_id', restaurantId).order('sort_order'),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).eq('is_available', true).order('sort_order'),
      ]);
      setRestaurant(restRes.data as any);
      setCategories((catRes.data as any[]) || []);
      setItems((itemRes.data as any[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [restaurantId]);

  // Realtime order tracking
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload: any) => {
        setOrderStatus(payload.new.status);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCategory) result = result.filter(i => i.category_id === activeCategory);
    if (searchQuery) result = result.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [items, activeCategory, searchQuery]);

  const popularItems = useMemo(() => items.filter(i => i.is_popular), [items]);

  const cartTotal = useMemo(() => cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
  };

  const getCartQuantity = (itemId: string) => cart.find(c => c.menuItem.id === itemId)?.quantity || 0;

  const placeOrder = async () => {
    if (!restaurantId || !tableNumber) { toast.error('Invalid table'); return; }
    setPlacing(true);

    // Find table
    const { data: tableData } = await supabase
      .from('restaurant_tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', tableNumber)
      .maybeSingle();

    if (!tableData) { toast.error('Table not found'); setPlacing(false); return; }

    // Create order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      restaurant_id: restaurantId,
      table_id: tableData.id,
      table_number: tableNumber,
      total_amount: cartTotal,
      customer_name: customerName || null,
      notes: orderNotes || null,
    } as any).select().single();

    if (orderError || !order) { toast.error(orderError?.message || 'Failed to place order'); setPlacing(false); return; }

    // Insert order items
    const orderItems = cart.map(c => ({
      order_id: (order as any).id,
      menu_item_id: c.menuItem.id,
      item_name: c.menuItem.name,
      item_price: c.menuItem.price,
      quantity: c.quantity,
      notes: c.notes || null,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems as any);
    if (itemsError) { toast.error('Order placed but items may be incomplete'); }

    setOrderId((order as any).id);
    setOrderStatus('received');
    setCart([]);
    setOrderDialog(false);
    setCartOpen(false);
    setPlacing(false);
    toast.success('Order placed successfully!');
  };

  const statusSteps = ['received', 'preparing', 'ready', 'served'];
  const currentStep = statusSteps.indexOf(orderStatus || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-hotel" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Restaurant Not Found</h2>
          <p className="text-muted-foreground">The restaurant you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  // ---- Order Status View ----
  if (orderId && orderStatus) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8 space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground">Table {tableNumber} · #{orderId.slice(0, 8)}</p>
          </div>

          {/* Status Tracker */}
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-6">Order Status</h3>
              <div className="space-y-4">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {i <= currentStep ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`font-medium capitalize ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</p>
                      <p className="text-xs text-muted-foreground">
                        {step === 'received' && 'Your order has been received'}
                        {step === 'preparing' && 'Chef is preparing your food'}
                        {step === 'ready' && 'Your order is ready for pickup'}
                        {step === 'served' && 'Enjoy your meal!'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => { setOrderId(null); setOrderStatus(null); }}>
            Order More
          </Button>
        </div>
      </div>
    );
  }

  // ---- Menu View ----
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">{restaurant.cuisine_type || 'Multi-cuisine'} · Table {tableNumber}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-hotel/20 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-hotel" />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search menu..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveCategory(null)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!activeCategory ? 'bg-hotel text-white' : 'bg-muted text-muted-foreground'}`}>All</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-hotel text-white' : 'bg-muted text-muted-foreground'}`}>{c.name}</button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Popular Items */}
        {!activeCategory && !searchQuery && popularItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Popular</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {popularItems.map(item => (
                <MenuItemCard key={item.id} item={item} qty={getCartQuantity(item.id)} onAdd={() => addToCart(item)} onUpdate={(d) => updateQuantity(item.id, d)} />
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div>
          {!activeCategory && !searchQuery && <h2 className="text-lg font-bold mb-3">Full Menu</h2>}
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} qty={getCartQuantity(item.id)} onAdd={() => addToCart(item)} onUpdate={(d) => updateQuantity(item.id, d)} />
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-50">
          <Button className="w-full h-14 bg-hotel hover:bg-hotel/90 text-white shadow-xl rounded-2xl text-base" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            {cartCount} item{cartCount > 1 ? 's' : ''} · ₹{cartTotal}
            <span className="ml-auto">View Cart →</span>
          </Button>
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Your Cart ({cartCount} items)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {cart.map(c => (
              <div key={c.menuItem.id} className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${c.menuItem.is_veg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>{c.menuItem.is_veg ? '🟢' : '🔴'}</Badge>
                    <p className="font-medium">{c.menuItem.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">₹{c.menuItem.price} × {c.quantity} = ₹{c.menuItem.price * c.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(c.menuItem.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-6 text-center font-semibold">{c.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(c.menuItem.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-hotel hover:bg-hotel/90" onClick={() => { setCartOpen(false); setOrderDialog(true); }}>
              <Send className="w-4 h-4 mr-2" /> Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation Dialog */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Order</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Table {tableNumber}</p>
              <p className="text-lg font-bold">₹{cartTotal}</p>
              <p className="text-sm text-muted-foreground">{cartCount} item{cartCount > 1 ? 's' : ''}</p>
            </div>
            <div><Label>Your Name (optional)</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter your name" /></div>
            <div><Label>Special Instructions (optional)</Label><Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Any allergies or special requests?" /></div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-hotel hover:bg-hotel/90" onClick={placeOrder} disabled={placing}>
              {placing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Confirm & Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuItemCard({ item, qty, onAdd, onUpdate }: { item: MenuItem; qty: number; onAdd: () => void; onUpdate: (d: number) => void }) {
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <div className="flex">
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-xs px-1.5 ${item.is_veg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
              {item.is_veg ? <Leaf className="w-3 h-3" /> : <span className="text-xs">🔴</span>}
            </Badge>
            {item.is_popular && <Badge className="bg-orange-500/20 text-orange-400 text-xs"><Flame className="w-3 h-3 mr-1" />Popular</Badge>}
          </div>
          <h3 className="font-semibold">{item.name}</h3>
          {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
          <p className="font-bold mt-2">₹{item.price}</p>
        </div>
        <div className="relative w-28 flex-shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
            {qty === 0 ? (
              <Button size="sm" className="bg-white text-hotel border-2 border-hotel hover:bg-hotel hover:text-white rounded-xl shadow-lg h-8 px-4" onClick={onAdd}>
                <Plus className="w-4 h-4 mr-1" /> ADD
              </Button>
            ) : (
              <div className="flex items-center gap-1 bg-hotel text-white rounded-xl shadow-lg h-8">
                <button className="px-2 h-full" onClick={() => onUpdate(-1)}><Minus className="w-3 h-3" /></button>
                <span className="px-1 font-semibold text-sm">{qty}</span>
                <button className="px-2 h-full" onClick={() => onUpdate(1)}><Plus className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
