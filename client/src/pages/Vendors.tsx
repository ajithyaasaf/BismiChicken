import { useState, useRef } from "react";
import { useData } from "../context/DataContext";
import VendorForm from "../components/VendorForm";
import { Vendor } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function Vendors() {
  const { vendors, addVendor, updateVendor, deleteVendor, loadingVendors } = useData();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleOpenAddVendor = () => {
    setIsAddVendorOpen(true);
  };

  const handleCloseAddVendor = () => {
    setIsAddVendorOpen(false);
  };

  const handleAddVendor = async (data: Omit<Vendor, "id" | "userId">) => {
    await addVendor(data);
  };

  const handleOpenEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditVendorOpen(true);
  };

  const handleCloseEditVendor = () => {
    setSelectedVendor(null);
    setIsEditVendorOpen(false);
  };

  const handleEditVendor = async (data: Partial<Omit<Vendor, "id" | "userId">>) => {
    if (selectedVendor) {
      await updateVendor(selectedVendor.id, data);
    }
  };

  const handleOpenDeleteVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedVendor(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedVendor) {
      await deleteVendor(selectedVendor.id);
      setIsDeleteDialogOpen(false);
      setSelectedVendor(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Vendor Management</h2>
        <Button 
          onClick={handleOpenAddVendor}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingVendors ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No vendors found. Add your first vendor to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors.map((vendor) => (
                      <TableRow key={vendor.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          {vendor.name}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {vendor.phone}
                        </TableCell>
                        <TableCell className="text-gray-500 max-w-xs truncate">
                          {vendor.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            className="text-primary hover:text-primary/80 mr-4"
                            onClick={() => handleOpenEditVendor(vendor)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleOpenDeleteVendor(vendor)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Form */}
      <VendorForm
        open={isAddVendorOpen}
        onClose={handleCloseAddVendor}
        onSubmit={handleAddVendor}
      />

      {/* Edit Vendor Form */}
      {selectedVendor && (
        <VendorForm
          open={isEditVendorOpen}
          onClose={handleCloseEditVendor}
          onSubmit={handleEditVendor}
          initialData={selectedVendor}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete vendor "{selectedVendor?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
