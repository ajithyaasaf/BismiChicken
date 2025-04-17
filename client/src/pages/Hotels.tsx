import { useState } from "react";
import { useData } from "../context/DataContext";
import HotelForm from "../components/HotelForm";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  Building2Icon,
  PhoneIcon,
  UserIcon,
  MapPinIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hotel } from "@shared/schema";

export default function Hotels() {
  const {
    hotels,
    loadingHotels,
    addHotel,
    updateHotel,
    deleteHotel
  } = useData();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddHotel = async (data: any) => {
    await addHotel(data);
  };

  const handleEditClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (selectedHotel) {
      await updateHotel(selectedHotel.id, data);
      setEditDialogOpen(false);
      setSelectedHotel(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await deleteHotel(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hotels Management</h2>
        <p className="text-gray-500 mt-1">
          Add and manage your hotel clients and manage their orders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hotel Form */}
        <div className="lg:col-span-1">
          <HotelForm onSubmit={handleAddHotel} />
        </div>

        {/* Hotels List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2Icon className="h-5 w-5 mr-2 text-primary" />
                Hotel Clients List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHotels ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hotels have been added yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotels.map((hotel) => (
                      <TableRow key={hotel.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Building2Icon className="h-4 w-4 mr-2 text-gray-400" />
                            {hotel.name}
                          </div>
                          {hotel.address && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {hotel.address}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {hotel.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hotel.contactPerson ? (
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {hotel.contactPerson}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditClick(hotel)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteClick(hotel.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Hotel Dialog */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Edit Hotel</h3>
              <HotelForm 
                initialData={selectedHotel}
                onSubmit={handleEditSubmit}
                isEdit={true}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedHotel(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hotel? This action cannot be undone.
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