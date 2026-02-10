import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Edit, Trash2, QrCode, UtensilsCrossed, LayoutGrid,
  ClipboardList, Search, RefreshCw, Eye, Loader2, ChefHat,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useRestaurants, useMenuCategories, useMenuItems,
  useRestaurantTables, useOrders,
  type Restaurant, type MenuItem, type MenuCategory, type RestaurantTable, type Order,
} from "@/hooks/useRestaurant";

export const AdminRestaurantManagement = () => {
  const { restaurants, isLoading: loadingRestaurants, refetch: refetchRestaurants } = useRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const { categories, refetch: refetchCategories } = useMenuCategories(selectedRestaurant);
  const { items, refetch: refetchItems } = useMenuItems(selectedRestaurant);
  const { tables, refetch: refetchTables } = useRestaurantTables(selectedRestaurant);
  const { orders, refetch: refetchOrders } = useOrders(selectedRestaurant);

  // Dialog states
  const [restaurantDialog, setRestaurantDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [menuItemDialog, setMenuItemDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [restForm, setRestForm] = useState({ name: '', description: '', cuisine_type: '', opening_time: '09:00', closing_time: '23:00' });
  const [catForm, setCatForm] = useState({ name: '', description: '', sort_order: 0 });
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: 0, category_id: '', is_veg: true, is_available: true, is_popular: false, image_url: '' });
  const [tableForm, setTableForm] = useState({ table_number: 1, capacity: 4 });

  const [editId, setEditId] = useState<string | null>(null);

  const activeRestaurant = restaurants.find(r => r.id === selectedRestaurant);

  // ---- Restaurant CRUD ----
  const saveRestaurant = async () => {
    setSaving(true);
    if (editId) {
      const { error } = await supabase.from('restaurants').update(restForm as any).eq('id', editId);
      if (error) toast.error(error.message); else { toast.success('Restaurant updated'); refetchRestaurants(); }
    } else {
      const { error } = await supabase.from('restaurants').insert(restForm as any);
      if (error) toast.error(error.message); else { toast.success('Restaurant created'); refetchRestaurants(); }
    }
    setSaving(false);
    setRestaurantDialog(false);
    setEditId(null);
  };

  const deleteRestaurant = async (id: string) => {
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refetchRestaurants(); if (selectedRestaurant === id) setSelectedRestaurant(null); }
  };

  // ---- Category CRUD ----
  const saveCategory = async () => {
    if (!selectedRestaurant) return;
    setSaving(true);
    const payload = { ...catForm, restaurant_id: selectedRestaurant } as any;
    if (editId) {
      const { error } = await supabase.from('menu_categories').update(payload).eq('id', editId);
      if (error) toast.error(error.message); else { toast.success('Category updated'); refetchCategories(); }
    } else {
      const { error } = await supabase.from('menu_categories').insert(payload);
      if (error) toast.error(error.message); else { toast.success('Category created'); refetchCategories(); }
    }
    setSaving(false);
    setCategoryDialog(false);
    setEditId(null);
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refetchCategories(); }
  };

  // ---- Menu Item CRUD ----
  const saveMenuItem = async () => {
    if (!selectedRestaurant) return;
    setSaving(true);
    const payload = { ...itemForm, restaurant_id: selectedRestaurant, category_id: itemForm.category_id || null } as any;
    if (editId) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editId);
      if (error) toast.error(error.message); else { toast.success('Item updated'); refetchItems(); }
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      if (error) toast.error(error.message); else { toast.success('Item created'); refetchItems(); }
    }
    setSaving(false);
    setMenuItemDialog(false);
    setEditId(null);
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refetchItems(); }
  };

  // ---- Table CRUD ----
  const saveTable = async () => {
    if (!selectedRestaurant) return;
    setSaving(true);
    const qrUrl = `${window.location.origin}/restaurant-menu/${selectedRestaurant}?table=${tableForm.table_number}`;
    const payload = { ...tableForm, restaurant_id: selectedRestaurant, qr_code: qrUrl } as any;
    if (editId) {
      const { error } = await supabase.from('restaurant_tables').update(payload).eq('id', editId);
      if (error) toast.error(error.message); else { toast.success('Table updated'); refetchTables(); }
    } else {
      const { error } = await supabase.from('restaurant_tables').insert(payload);
      if (error) toast.error(error.message); else { toast.success('Table created'); refetchTables(); }
    }
    setSaving(false);
    setTableDialog(false);
    setEditId(null);
  };

  const deleteTable = async (id: string) => {
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); refetchTables(); }
  };

  // ---- Order Management ----
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status } as any).eq('id', orderId);
    if (error) toast.error(error.message); else { toast.success(`Order ${status}`); refetchOrders(); }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      received: 'bg-blue-500/20 text-blue-400',
      preparing: 'bg-amber-500/20 text-amber-400',
      ready: 'bg-emerald-500/20 text-emerald-400',
      served: 'bg-slate-500/20 text-slate-400',
      cancelled: 'bg-red-500/20 text-red-400',
      available: 'bg-emerald-500/20 text-emerald-400',
      occupied: 'bg-red-500/20 text-red-400',
      reserved: 'bg-amber-500/20 text-amber-400',
    };
    return map[status] || 'bg-slate-500/20 text-slate-400';
  };

  if (!selectedRestaurant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Restaurant Management</h2>
          <Button onClick={() => { setRestForm({ name: '', description: '', cuisine_type: '', opening_time: '09:00', closing_time: '23:00' }); setEditId(null); setRestaurantDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Restaurant
          </Button>
        </div>

        {loadingRestaurants ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : restaurants.length === 0 ? (
          <Card className="bg-card/50 border-border/50 p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Restaurants Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first restaurant to get started</p>
            <Button onClick={() => { setRestForm({ name: '', description: '', cuisine_type: '', opening_time: '09:00', closing_time: '23:00' }); setRestaurantDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Restaurant
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(r => (
              <Card key={r.id} className="bg-card/50 border-border/50 hover:border-hotel/30 transition-all cursor-pointer" onClick={() => setSelectedRestaurant(r.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-hotel/20 flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-hotel" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{r.name}</h3>
                        <p className="text-sm text-muted-foreground">{r.cuisine_type || 'Multi-cuisine'}</p>
                      </div>
                    </div>
                    <Badge className={r.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{r.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hours: {r.opening_time} - {r.closing_time}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditId(r.id); setRestForm({ name: r.name, description: r.description || '', cuisine_type: r.cuisine_type || '', opening_time: r.opening_time || '09:00', closing_time: r.closing_time || '23:00' }); setRestaurantDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400" onClick={(e) => { e.stopPropagation(); deleteRestaurant(r.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Restaurant Dialog */}
        <Dialog open={restaurantDialog} onOpenChange={setRestaurantDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Restaurant</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={restForm.name} onChange={e => setRestForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Cuisine Type</Label><Input value={restForm.cuisine_type} onChange={e => setRestForm(p => ({ ...p, cuisine_type: e.target.value }))} placeholder="Multi-cuisine, Indian, etc." /></div>
              <div><Label>Description</Label><Textarea value={restForm.description} onChange={e => setRestForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Opening Time</Label><Input type="time" value={restForm.opening_time} onChange={e => setRestForm(p => ({ ...p, opening_time: e.target.value }))} /></div>
                <div><Label>Closing Time</Label><Input type="time" value={restForm.closing_time} onChange={e => setRestForm(p => ({ ...p, closing_time: e.target.value }))} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={saveRestaurant} disabled={saving || !restForm.name}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editId ? 'Update' : 'Create'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---- Restaurant Detail View ----
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setSelectedRestaurant(null)}>← Back</Button>
        <div>
          <h2 className="text-xl font-bold">{activeRestaurant?.name}</h2>
          <p className="text-sm text-muted-foreground">{activeRestaurant?.cuisine_type || 'Multi-cuisine'}</p>
        </div>
      </div>

      <Tabs defaultValue="menu">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="menu"><ChefHat className="w-4 h-4 mr-2" />Menu Items</TabsTrigger>
          <TabsTrigger value="categories"><LayoutGrid className="w-4 h-4 mr-2" />Categories</TabsTrigger>
          <TabsTrigger value="tables"><QrCode className="w-4 h-4 mr-2" />Tables & QR</TabsTrigger>
          <TabsTrigger value="orders"><ClipboardList className="w-4 h-4 mr-2" />Live Orders</TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="menu" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Menu Items ({items.length})</h3>
            <Button onClick={() => { setItemForm({ name: '', description: '', price: 0, category_id: '', is_veg: true, is_available: true, is_popular: false, image_url: '' }); setEditId(null); setMenuItemDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
          <Card className="bg-card/50 border-border/50">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image_url ? <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground" /></div>}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{categories.find(c => c.id === item.category_id)?.name || '-'}</TableCell>
                    <TableCell className="font-semibold">₹{item.price}</TableCell>
                    <TableCell><Badge variant="outline" className={item.is_veg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}>{item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</Badge></TableCell>
                    <TableCell><Badge className={item.is_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>{item.is_available ? 'Available' : 'Unavailable'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditId(item.id); setItemForm({ name: item.name, description: item.description || '', price: item.price, category_id: item.category_id || '', is_veg: item.is_veg, is_available: item.is_available, is_popular: item.is_popular, image_url: item.image_url || '' }); setMenuItemDialog(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => deleteMenuItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No menu items yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Categories ({categories.length})</h3>
            <Button onClick={() => { setCatForm({ name: '', description: '', sort_order: 0 }); setEditId(null); setCategoryDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Card key={cat.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{cat.name}</h4>
                    <p className="text-sm text-muted-foreground">{cat.description || 'No description'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{items.filter(i => i.category_id === cat.id).length} items</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditId(cat.id); setCatForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order }); setCategoryDialog(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => deleteCategory(cat.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {categories.length === 0 && (
              <Card className="col-span-full bg-card/50 border-border/50 p-8 text-center">
                <p className="text-muted-foreground">No categories yet. Create one to organize your menu.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tables & QR Tab */}
        <TabsContent value="tables" className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Tables ({tables.length})</h3>
            <Button onClick={() => { setTableForm({ table_number: (tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1), capacity: 4 }); setEditId(null); setTableDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Table
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tables.map(table => (
              <Card key={table.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-hotel/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-hotel">T{table.table_number}</span>
                  </div>
                  <div>
                    <p className="font-semibold">Table {table.table_number}</p>
                    <p className="text-sm text-muted-foreground">{table.capacity} seats</p>
                  </div>
                  <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
                  {table.qr_code && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground break-all">{table.qr_code}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { navigator.clipboard.writeText(table.qr_code || ''); toast.success('QR link copied!'); }}>
                        <QrCode className="w-4 h-4 mr-2" /> Copy QR Link
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => { setEditId(table.id); setTableForm({ table_number: table.table_number, capacity: table.capacity }); setTableDialog(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => deleteTable(table.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tables.length === 0 && (
              <Card className="col-span-full bg-card/50 border-border/50 p-8 text-center">
                <QrCode className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No tables yet. Add tables to generate QR codes.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Live Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Live Orders ({orders.filter(o => !['served', 'cancelled'].includes(o.status)).length} active)</h3>
            <Button variant="outline" onClick={refetchOrders}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => !['served', 'cancelled'].includes(o.status)).map(order => (
              <Card key={order.id} className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Table {order.table_number}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleTimeString()}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">₹{order.total_amount}</span>
                  </div>
                  {order.customer_name && <p className="text-sm text-muted-foreground">Customer: {order.customer_name}</p>}
                  <div className="flex gap-2">
                    {order.status === 'received' && <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={() => updateOrderStatus(order.id, 'preparing')}>Start Preparing</Button>}
                    {order.status === 'preparing' && <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={() => updateOrderStatus(order.id, 'ready')}>Mark Ready</Button>}
                    {order.status === 'ready' && <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, 'served')}>Mark Served</Button>}
                    <Button size="sm" variant="outline" className="text-red-400" onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {orders.filter(o => !['served', 'cancelled'].includes(o.status)).length === 0 && (
              <Card className="col-span-full bg-card/50 border-border/50 p-8 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active orders right now</p>
              </Card>
            )}
          </div>

          {/* Completed orders */}
          {orders.filter(o => ['served', 'cancelled'].includes(o.status)).length > 0 && (
            <>
              <h4 className="text-md font-semibold mt-6">Completed Orders</h4>
              <Card className="bg-card/50 border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Order ID</TableHead><TableHead>Table</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter(o => ['served', 'cancelled'].includes(o.status)).slice(0, 20).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>Table {order.table_number}</TableCell>
                        <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                        <TableCell><Badge className={getStatusColor(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><Label>Sort Order</Label><Input type="number" value={catForm.sort_order} onChange={e => setCatForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <DialogFooter><Button onClick={saveCategory} disabled={saving || !catForm.name}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialog} onOpenChange={setMenuItemDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div><Label>Name</Label><Input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (₹)</Label><Input type="number" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))} /></div>
              <div>
                <Label>Category</Label>
                <Select value={itemForm.category_id} onValueChange={v => setItemForm(p => ({ ...p, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Image URL</Label><Input value={itemForm.image_url} onChange={e => setItemForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><Switch checked={itemForm.is_veg} onCheckedChange={v => setItemForm(p => ({ ...p, is_veg: v }))} /><Label>Vegetarian</Label></div>
              <div className="flex items-center gap-2"><Switch checked={itemForm.is_available} onCheckedChange={v => setItemForm(p => ({ ...p, is_available: v }))} /><Label>Available</Label></div>
              <div className="flex items-center gap-2"><Switch checked={itemForm.is_popular} onCheckedChange={v => setItemForm(p => ({ ...p, is_popular: v }))} /><Label>Popular</Label></div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveMenuItem} disabled={saving || !itemForm.name || !itemForm.price}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={tableDialog} onOpenChange={setTableDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Table</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Table Number</Label><Input type="number" value={tableForm.table_number} onChange={e => setTableForm(p => ({ ...p, table_number: parseInt(e.target.value) || 1 }))} /></div>
            <div><Label>Capacity (seats)</Label><Input type="number" value={tableForm.capacity} onChange={e => setTableForm(p => ({ ...p, capacity: parseInt(e.target.value) || 4 }))} /></div>
          </div>
          <DialogFooter><Button onClick={saveTable} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editId ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
