import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Hospital, Department, Doctor, HospitalService, 
  useAdminHospitals 
} from "@/hooks/useAdminHospitals";
import { 
  Building2, MapPin, Phone, Mail, Globe, Star, Bed, Clock,
  Stethoscope, Plus, Edit, Trash2, X, Check, IndianRupee
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HospitalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalId: string | null;
  onEdit: (hospital: Hospital) => void;
}

export function HospitalDetailsDialog({ 
  open, 
  onOpenChange, 
  hospitalId,
  onEdit 
}: HospitalDetailsDialogProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  
  // New item forms
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  
  const [newDoctor, setNewDoctor] = useState({ 
    name: "", specialty: "", qualification: "", experience_years: 0, consultation_fee: 500 
  });
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });
  const [newService, setNewService] = useState({ name: "", description: "", price: 0 });

  const { 
    getHospital, 
    addDoctor, 
    deleteDoctor, 
    addDepartment, 
    deleteDepartment,
    addService,
    deleteService 
  } = useAdminHospitals();

  useEffect(() => {
    if (hospitalId && open) {
      setIsLoading(true);
      getHospital(hospitalId).then((data) => {
        setHospital(data);
        setIsLoading(false);
      });
    }
  }, [hospitalId, open, getHospital]);

  const handleAddDoctor = async () => {
    if (!hospital || !newDoctor.name || !newDoctor.specialty) return;
    
    await addDoctor({
      ...newDoctor,
      hospital_id: hospital.id,
    });
    
    setNewDoctor({ name: "", specialty: "", qualification: "", experience_years: 0, consultation_fee: 500 });
    setShowAddDoctor(false);
    
    // Refresh hospital data
    const updated = await getHospital(hospital.id);
    setHospital(updated);
  };

  const handleAddDepartment = async () => {
    if (!hospital || !newDepartment.name) return;
    
    await addDepartment({
      ...newDepartment,
      hospital_id: hospital.id,
    });
    
    setNewDepartment({ name: "", description: "" });
    setShowAddDepartment(false);
    
    const updated = await getHospital(hospital.id);
    setHospital(updated);
  };

  const handleAddService = async () => {
    if (!hospital || !newService.name) return;
    
    await addService({
      ...newService,
      hospital_id: hospital.id,
    });
    
    setNewService({ name: "", description: "", price: 0 });
    setShowAddService(false);
    
    const updated = await getHospital(hospital.id);
    setHospital(updated);
  };

  const handleDelete = async () => {
    if (!deleteConfirm || !hospital) return;
    
    let success = false;
    if (deleteConfirm.type === "doctor") {
      success = await deleteDoctor(deleteConfirm.id);
    } else if (deleteConfirm.type === "department") {
      success = await deleteDepartment(deleteConfirm.id);
    } else if (deleteConfirm.type === "service") {
      success = await deleteService(deleteConfirm.id);
    }
    
    if (success) {
      const updated = await getHospital(hospital.id);
      setHospital(updated);
    }
    setDeleteConfirm(null);
  };

  if (!hospital) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-hospital" />
                {hospital.name}
              </div>
              <div className="flex gap-2">
                <Badge variant={hospital.is_active ? "default" : "secondary"}>
                  {hospital.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(hospital);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[600px] pr-4">
            {/* Hospital Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-hospital/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-hospital" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-semibold">{hospital.rating || 0} / 5</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Doctors</p>
                    <p className="font-semibold">{hospital.doctors?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <Bed className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Beds</p>
                    <p className="font-semibold">{hospital.beds_count}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hours</p>
                    <p className="font-semibold text-sm">{hospital.opening_hours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
                </div>
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                {hospital.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{hospital.email}</span>
                  </div>
                )}
                {hospital.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={hospital.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                      {hospital.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="doctors">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="doctors">
                  Doctors ({hospital.doctors?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="departments">
                  Departments ({hospital.departments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="services">
                  Services ({hospital.hospital_services?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doctors" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Doctors</h4>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddDoctor(true)}
                    className="bg-hospital hover:bg-hospital/90"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Doctor
                  </Button>
                </div>

                {showAddDoctor && (
                  <Card className="mb-4 border-hospital/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newDoctor.name}
                            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                            placeholder="Dr. Name"
                          />
                        </div>
                        <div>
                          <Label>Specialty *</Label>
                          <Input
                            value={newDoctor.specialty}
                            onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                            placeholder="Cardiologist"
                          />
                        </div>
                        <div>
                          <Label>Qualification</Label>
                          <Input
                            value={newDoctor.qualification}
                            onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                            placeholder="MBBS, MD"
                          />
                        </div>
                        <div>
                          <Label>Experience (years)</Label>
                          <Input
                            type="number"
                            value={newDoctor.experience_years}
                            onChange={(e) => setNewDoctor({ ...newDoctor, experience_years: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Consultation Fee (₹)</Label>
                          <Input
                            type="number"
                            value={newDoctor.consultation_fee}
                            onChange={(e) => setNewDoctor({ ...newDoctor, consultation_fee: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddDoctor(false)}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleAddDoctor} className="bg-hospital hover:bg-hospital/90">
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospital.doctors?.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.name}</TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.experience_years} yrs</TableCell>
                        <TableCell>₹{doctor.consultation_fee}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {doctor.rating || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: "doctor", id: doctor.id })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!hospital.doctors || hospital.doctors.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No doctors added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="departments" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Departments</h4>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddDepartment(true)}
                    className="bg-hospital hover:bg-hospital/90"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Department
                  </Button>
                </div>

                {showAddDepartment && (
                  <Card className="mb-4 border-hospital/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                            placeholder="Cardiology"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newDepartment.description}
                            onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                            placeholder="Heart and cardiovascular care"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddDepartment(false)}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleAddDepartment} className="bg-hospital hover:bg-hospital/90">
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hospital.departments?.map((dept) => (
                    <Card key={dept.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          {dept.description && (
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: "department", id: dept.id })}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {(!hospital.departments || hospital.departments.length === 0) && (
                    <p className="col-span-full text-center text-muted-foreground py-8">
                      No departments added yet
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Services</h4>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddService(true)}
                    className="bg-hospital hover:bg-hospital/90"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Service
                  </Button>
                </div>

                {showAddService && (
                  <Card className="mb-4 border-hospital/30">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            placeholder="X-Ray"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            placeholder="Diagnostic imaging"
                          />
                        </div>
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddService(false)}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleAddService} className="bg-hospital hover:bg-hospital/90">
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospital.hospital_services?.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="text-muted-foreground">{service.description || "-"}</TableCell>
                        <TableCell>
                          {service.price ? `₹${service.price}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteConfirm({ type: "service", id: service.id })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!hospital.hospital_services || hospital.hospital_services.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No services added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
