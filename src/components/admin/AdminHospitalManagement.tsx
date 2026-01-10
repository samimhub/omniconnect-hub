import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAdminHospitals, Hospital } from "@/hooks/useAdminHospitals";
import { HospitalFormDialog } from "./HospitalFormDialog";
import { HospitalDetailsDialog } from "./HospitalDetailsDialog";
import { 
  Search, Plus, Eye, Edit, Trash2, Building2, 
  Stethoscope, MapPin, Star, ToggleLeft, ToggleRight,
  Download, RefreshCw
} from "lucide-react";

export function AdminHospitalManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    hospitals,
    isLoading,
    fetchHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
    toggleHospitalStatus,
  } = useAdminHospitals();

  const handleSearch = () => {
    fetchHospitals(searchQuery, statusFilter === "all" ? undefined : statusFilter);
  };

  const handleFormSubmit = async (data: Partial<Hospital>) => {
    if (selectedHospital) {
      await updateHospital(selectedHospital.id, data);
    } else {
      await createHospital(data);
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setFormOpen(true);
  };

  const handleViewDetails = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setDetailsOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteHospital(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleToggleStatus = async (hospital: Hospital) => {
    await toggleHospitalStatus(hospital.id, !hospital.is_active);
  };

  // Filter hospitals based on search and status
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = !searchQuery || 
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && hospital.is_active) ||
      (statusFilter === "inactive" && !hospital.is_active);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: hospitals.length,
    active: hospitals.filter(h => h.is_active).length,
    totalDoctors: hospitals.reduce((sum, h) => sum + (h.doctors_count || 0), 0),
    avgRating: hospitals.length > 0 
      ? (hospitals.reduce((sum, h) => sum + (h.rating || 0), 0) / hospitals.length).toFixed(1)
      : "0",
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-hospital/10 border-hospital/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hospital/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-hospital" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hospitals</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ToggleRight className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-teal-500/10 border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="text-2xl font-bold">{stats.totalDoctors}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search hospitals..." 
              className="pl-10 bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => fetchHospitals()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button 
            className="gap-2 bg-hospital hover:bg-hospital/90"
            onClick={() => {
              setSelectedHospital(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Hospital
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Hospital</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Doctors</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredHospitals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hospitals found. Add your first hospital to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredHospitals.map((hospital) => (
                <TableRow key={hospital.id} className="border-border/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-hospital/20 flex items-center justify-center overflow-hidden">
                        {hospital.image_url ? (
                          <img 
                            src={hospital.image_url} 
                            alt={hospital.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-hospital" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{hospital.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {hospital.beds_count} beds
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{hospital.city}, {hospital.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="w-4 h-4 text-teal-500" />
                      <span>{hospital.doctors_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{hospital.rating || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={hospital.is_active 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }
                    >
                      {hospital.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewDetails(hospital.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(hospital)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleStatus(hospital)}
                      >
                        {hospital.is_active ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => setDeleteConfirm(hospital.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Form Dialog */}
      <HospitalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        hospital={selectedHospital}
        onSubmit={handleFormSubmit}
      />

      {/* Details Dialog */}
      <HospitalDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        hospitalId={selectedHospitalId}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hospital? This will also delete all associated doctors, departments, and services. This action cannot be undone.
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
    </div>
  );
}
