import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hospital } from "@/hooks/useAdminHospitals";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Bed, Calendar, Percent } from "lucide-react";

interface HospitalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital?: Hospital | null;
  onSubmit: (data: Partial<Hospital>) => Promise<void>;
}

export function HospitalFormDialog({ open, onOpenChange, hospital, onSubmit }: HospitalFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Hospital>>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    image_url: "",
    beds_count: 0,
    established_year: new Date().getFullYear(),
    opening_hours: "24/7",
    commission_percentage: 5,
    is_active: true,
    accreditations: [],
    facilities: [],
  });

  const [accreditationsInput, setAccreditationsInput] = useState("");
  const [facilitiesInput, setFacilitiesInput] = useState("");

  useEffect(() => {
    if (hospital) {
      setFormData(hospital);
      setAccreditationsInput(hospital.accreditations?.join(", ") || "");
      setFacilitiesInput(hospital.facilities?.join(", ") || "");
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        image_url: "",
        beds_count: 0,
        established_year: new Date().getFullYear(),
        opening_hours: "24/7",
        commission_percentage: 5,
        is_active: true,
        accreditations: [],
        facilities: [],
      });
      setAccreditationsInput("");
      setFacilitiesInput("");
    }
  }, [hospital, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      accreditations: accreditationsInput.split(",").map(s => s.trim()).filter(Boolean),
      facilities: facilitiesInput.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      await onSubmit(dataToSubmit);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-hospital" />
            {hospital ? "Edit Hospital" : "Add New Hospital"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4 pr-4">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Apollo Hospitals"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A brief description of the hospital..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url || ""}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/hospital.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@hospital.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.hospital.com"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 mt-0">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Address *
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full address of the hospital"
                      required
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="India"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode || ""}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="400001"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-0">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="beds_count" className="flex items-center gap-2">
                        <Bed className="w-4 h-4" /> Number of Beds
                      </Label>
                      <Input
                        id="beds_count"
                        type="number"
                        min="0"
                        value={formData.beds_count || 0}
                        onChange={(e) => setFormData({ ...formData, beds_count: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="established_year" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Established Year
                      </Label>
                      <Input
                        id="established_year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.established_year || ""}
                        onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || undefined })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="opening_hours" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Opening Hours
                      </Label>
                      <Input
                        id="opening_hours"
                        value={formData.opening_hours || ""}
                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                        placeholder="24/7 or 9 AM - 9 PM"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="commission" className="flex items-center gap-2">
                        <Percent className="w-4 h-4" /> Commission %
                      </Label>
                      <Input
                        id="commission"
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={formData.commission_percentage || 5}
                        onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="accreditations">Accreditations (comma-separated)</Label>
                    <Input
                      id="accreditations"
                      value={accreditationsInput}
                      onChange={(e) => setAccreditationsInput(e.target.value)}
                      placeholder="NABH, JCI, ISO 9001"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                    <Textarea
                      id="facilities"
                      value={facilitiesInput}
                      onChange={(e) => setFacilitiesInput(e.target.value)}
                      placeholder="ICU, Emergency, Pharmacy, Parking, Cafeteria"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label htmlFor="is_active" className="text-base font-medium">Active Status</Label>
                      <p className="text-sm text-muted-foreground">Hospital will be visible to users</p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-hospital hover:bg-hospital/90" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : hospital ? "Update Hospital" : "Add Hospital"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
