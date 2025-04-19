import { useState } from "react";
import { useData } from "../context/EnhancedDataContext";
import HotelForm from "../components/HotelForm";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  Building2Icon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  MailIcon,
  InfoIcon,
  Badge,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Hotel } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddHotel = async (data: any) => {
    await addHotel(data);
  };

  const handleViewDetails = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setDetailsDialogOpen(true);
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

  // Get readable text for order frequency
  const getOrderFrequencyText = (frequency: string | null | undefined) => {
    if (!frequency) return "Not specified";
    
    const map: Record<string, string> = {
      "daily": "Daily",
      "alternate_days": "Alternate Days",
      "weekly": "Weekly",
      "biweekly": "Bi-Weekly",
      "monthly": "Monthly",
      "on_demand": "On Demand"
    };
    
    return map[frequency] || frequency;
  };
  
  // Get readable text for payment terms
  const getPaymentTermsText = (terms: string | null | undefined) => {
    if (!terms) return "Not specified";
    
    const map: Record<string, string> = {
      "cash": "Cash on Delivery",
      "7days": "7 Days Credit",
      "15days": "15 Days Credit",
      "30days": "30 Days Credit",
      "prepaid": "Prepaid",
      "custom": "Custom Terms"
    };
    
    return map[terms] || terms;
  };
  
  // Get readable text for delivery time
  const getDeliveryTimeText = (time: string | null | undefined) => {
    if (!time) return "Not specified";
    
    const map: Record<string, string> = {
      "morning": "Morning (6am-10am)",
      "midday": "Midday (10am-2pm)",
      "afternoon": "Afternoon (2pm-6pm)",
      "evening": "Evening (6pm-10pm)",
      "custom": "Custom Time"
    };
    
    return map[time] || time;
  };
  
  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hotels Management</h2>
        <p className="text-gray-500 mt-1">
          Add and manage your hotel clients with order preferences for efficient daily sales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Hotel Form */}
        <div className="md:col-span-1">
          <HotelForm onSubmit={handleAddHotel} />
        </div>

        {/* Hotels List */}
        <div className="md:col-span-1 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center">
                    <Building2Icon className="h-5 w-5 mr-2 text-primary" />
                    Hotel Clients List
                  </CardTitle>
                  <CardDescription>
                    {hotels.length} hotel clients in total
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1 h-9 md:hidden"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Hotel</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHotels ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2Icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hotels have been added yet</p>
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="mt-4 mx-auto flex items-center gap-1"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Your First Hotel</span>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop View - Table */}
                  <div className="hidden md:block overflow-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Order Info</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hotels.map((hotel) => (
                          <TableRow key={hotel.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
                                  <Building2Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-slate-800 font-medium">{hotel.name}</span>
                                  {hotel.isActive === false && (
                                    <UIBadge variant="outline" className="ml-2 bg-slate-100 text-slate-500 border-slate-200">
                                      Inactive
                                    </UIBadge>
                                  )}
                                  {hotel.address && (
                                    <div className="text-xs text-slate-500 mt-1 flex items-center">
                                      <MapPinIcon className="h-3 w-3 mr-1 text-slate-400" />
                                      {hotel.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1.5">
                                <div className="flex items-center text-slate-700">
                                  <PhoneIcon className="h-4 w-4 mr-2 text-slate-400" />
                                  {hotel.phone}
                                </div>
                                {hotel.contactPerson && (
                                  <div className="text-xs text-slate-500 flex items-center">
                                    <UserIcon className="h-3 w-3 mr-2 text-slate-400" />
                                    {hotel.contactPerson}
                                  </div>
                                )}
                                {hotel.email && (
                                  <div className="text-xs text-slate-500 flex items-center">
                                    <MailIcon className="h-3 w-3 mr-2 text-slate-400" />
                                    {hotel.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2 text-sm">
                                {hotel.orderFrequency && (
                                  <div className="flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md">
                                    <CalendarIcon className="h-3 w-3 mr-1.5 text-primary" />
                                    <span className="text-slate-700">{getOrderFrequencyText(hotel.orderFrequency)}</span>
                                  </div>
                                )}
                                {hotel.preferredDeliveryTime && (
                                  <div className="flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md">
                                    <ClockIcon className="h-3 w-3 mr-1.5 text-primary" />
                                    <span className="text-slate-700">{getDeliveryTimeText(hotel.preferredDeliveryTime)}</span>
                                  </div>
                                )}
                                {hotel.paymentTerms && (
                                  <div className="flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md">
                                    <CreditCardIcon className="h-3 w-3 mr-1.5 text-primary" />
                                    <span className="text-slate-700">{getPaymentTermsText(hotel.paymentTerms)}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-600"
                                        onClick={() => handleViewDetails(hotel)}
                                      >
                                        <InfoIcon className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 text-white">
                                      <p className="text-xs">View Details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full border-slate-200 hover:border-primary/30 hover:bg-primary/5 text-slate-600"
                                        onClick={() => handleEditClick(hotel)}
                                      >
                                        <PencilIcon className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 text-white">
                                      <p className="text-xs">Edit Hotel</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-500"
                                        onClick={() => handleDeleteClick(hotel.id)}
                                      >
                                        <TrashIcon className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 text-white">
                                      <p className="text-xs">Delete Hotel</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4">
                    {hotels.map((hotel) => (
                      <Card key={hotel.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow transition-all">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base flex items-center">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                                <Building2Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-slate-800">{hotel.name}</span>
                            </CardTitle>
                            {hotel.isActive === false && (
                              <UIBadge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">
                                Inactive
                              </UIBadge>
                            )}
                          </div>
                          {hotel.address && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center ml-9">
                              <MapPinIcon className="h-3 w-3 mr-1 text-slate-400" />
                              {hotel.address}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="mt-2">
                              <div className="flex items-center text-slate-700">
                                <PhoneIcon className="h-4 w-4 mr-2 text-slate-400" />
                                {hotel.phone}
                              </div>
                              {hotel.contactPerson && (
                                <div className="text-xs text-slate-500 mt-1.5 flex items-center ml-0.5">
                                  <UserIcon className="h-3 w-3 mr-1.5 text-slate-400" />
                                  {hotel.contactPerson}
                                </div>
                              )}
                              {hotel.email && (
                                <div className="text-xs text-slate-500 mt-1.5 flex items-center ml-0.5">
                                  <MailIcon className="h-3 w-3 mr-1.5 text-slate-400" />
                                  {hotel.email}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mt-1">
                              {hotel.orderFrequency && (
                                <div className="inline-flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md mr-1.5">
                                  <CalendarIcon className="h-3 w-3 mr-1.5 text-primary" />
                                  <span className="text-slate-700">{getOrderFrequencyText(hotel.orderFrequency)}</span>
                                </div>
                              )}
                              {hotel.preferredDeliveryTime && (
                                <div className="inline-flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md mr-1.5">
                                  <ClockIcon className="h-3 w-3 mr-1.5 text-primary" />
                                  <span className="text-slate-700">{getDeliveryTimeText(hotel.preferredDeliveryTime)}</span>
                                </div>
                              )}
                              {hotel.paymentTerms && (
                                <div className="inline-flex items-center text-xs bg-slate-50 px-2 py-1 rounded-md">
                                  <CreditCardIcon className="h-3 w-3 mr-1.5 text-primary" />
                                  <span className="text-slate-700">{getPaymentTermsText(hotel.paymentTerms)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-end space-x-1 border-t border-slate-100 pt-3 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs rounded-full border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                onClick={() => handleViewDetails(hotel)}
                              >
                                <InfoIcon className="h-3.5 w-3.5 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs rounded-full border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                onClick={() => handleEditClick(hotel)}
                              >
                                <PencilIcon className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs rounded-full border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                onClick={() => handleDeleteClick(hotel.id)}
                              >
                                <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hotel Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2Icon className="h-5 w-5 mr-2 text-primary" />
              {selectedHotel?.name}
              {selectedHotel?.isActive === false && (
                <UIBadge variant="outline" className="ml-2 bg-gray-100 text-gray-500">
                  Inactive
                </UIBadge>
              )}
            </DialogTitle>
            <DialogDescription>
              Complete hotel details and order preferences
            </DialogDescription>
          </DialogHeader>
          
          {selectedHotel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <Card className="shadow-none border border-gray-200">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Address:</span> {selectedHotel.address || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedHotel.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedHotel.email || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Contact Person:</span> {selectedHotel.contactPerson || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {selectedHotel.isActive !== false ? (
                      <span className="text-green-600 inline-flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="text-gray-500 inline-flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Inactive
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-none border border-gray-200">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">Order Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Order Frequency:</span> {getOrderFrequencyText(selectedHotel.orderFrequency)}
                  </div>
                  <div>
                    <span className="font-medium">Delivery Time:</span> {getDeliveryTimeText(selectedHotel.preferredDeliveryTime)}
                  </div>
                  <div>
                    <span className="font-medium">Delivery Notes:</span> {selectedHotel.deliveryNotes || "None"}
                  </div>
                  <div>
                    <span className="font-medium">Last Order:</span> {formatDate(selectedHotel.lastOrderDate)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-none border border-gray-200 md:col-span-2">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">Payment & Billing</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Payment Terms:</span> {getPaymentTermsText(selectedHotel.paymentTerms)}
                  </div>
                  <div>
                    <span className="font-medium">Credit Limit:</span> {selectedHotel.creditLimit ? `₹${selectedHotel.creditLimit}` : "No credit limit"}
                  </div>
                </CardContent>
              </Card>
              
              {selectedHotel.preferredProducts && (
                <Card className="shadow-none border border-gray-200 md:col-span-2">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm">Regular Order Pattern</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-sm">
                    <p>{selectedHotel.preferredProducts}</p>
                  </CardContent>
                </Card>
              )}
              
              {selectedHotel.notes && (
                <Card className="shadow-none border border-gray-200 md:col-span-2">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-sm">
                    <p>{selectedHotel.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setDetailsDialogOpen(false);
                handleEditClick(selectedHotel!);
              }}
            >
              Edit Hotel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Hotel</DialogTitle>
            <DialogDescription>
              Make changes to the hotel details and order preferences
            </DialogDescription>
          </DialogHeader>
          
          {selectedHotel && (
            <HotelForm 
              initialData={selectedHotel}
              onSubmit={handleEditSubmit}
              isEdit={true}
            />
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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