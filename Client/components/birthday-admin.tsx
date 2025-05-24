'use client';

import type React from 'react';

import { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ClassMateProps } from '@/app/admin/page';

// Array of months for the dropdown
const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Function to get days in a month
const getDaysInMonth = (month: string) => {
  const daysInMonth = new Date(2024, Number.parseInt(month), 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));
};

// Function to format month and day to display
const formatBirthday = (month: string, day: string) => {
  const monthName = months.find((m) => m.value === month)?.label;
  return `${monthName} ${day}`;
};

// Mock data - in a real app, this would come from your API
const mockBirthdayData = [
  {
    id: 1,
    name: 'John Doe',
    phone_number: '(555) 123-4567',
    birth_month: '7',
    birth_day: '15',
    photo: '/placeholder.svg?height=40&width=40',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone_number: '(555) 987-6543',
    birth_month: '3',
    birth_day: '22',
    photo: '/placeholder.svg?height=40&width=40',
    created_at: new Date('2024-01-16'),
    updated_at: new Date('2024-01-16'),
  },
  {
    id: 3,
    name: 'Mike Johnson',
    phone_number: '(555) 456-7890',
    birth_month: '11',
    birth_day: '8',
    photo: null,
    created_at: new Date('2024-01-17'),
    updated_at: new Date('2024-01-17'),
  },
];

type BirthdayRecord = (typeof mockBirthdayData)[0];

// Edit form schema
const editFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone_number: z.string().min(1, 'Phone number is required.'),
  birth_month: z.string().min(1, 'Birth month is required.'),
  birth_day: z.string().min(1, 'Birth day is required.'),
  photo: z.instanceof(File).optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

export default function BirthdayAdmin(data: ClassMateProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [birthdayData, setBirthdayData] = useState(mockBirthdayData);
  const [editingRecord, setEditingRecord] = useState<BirthdayRecord | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Edit form
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      birth_month: '',
      birth_day: '',
    },
  });

  // Get days based on selected month
  const days = selectedMonth ? getDaysInMonth(selectedMonth) : [];

  // Handle month change to reset day if it's invalid for the new month
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    editForm.setValue('birth_month', month);

    // Reset day if it's invalid for the new month
    const currentDay = editForm.getValues('birth_day');
    const daysInNewMonth = getDaysInMonth(month).length;

    if (currentDay && Number.parseInt(currentDay) > daysInNewMonth) {
      editForm.setValue('birth_day', '');
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return birthdayData;

    return birthdayData.filter(
      (record) =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [birthdayData, searchTerm]);

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a .jpg, .jpeg, or .png file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (optional - 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      editForm.setValue('photo', file);
      setRemoveCurrentImage(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    editForm.setValue('photo', undefined);
    setImagePreview(null);
    setRemoveCurrentImage(true);
    // Reset file input
    const fileInput = document.getElementById(
      'edit-photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle edit
  const handleEdit = (record: BirthdayRecord) => {
    setEditingRecord(record);
    editForm.reset({
      name: record.name,
      phone_number: record.phone_number,
      birth_month: record.birth_month,
      birth_day: record.birth_day,
    });
    setSelectedMonth(record.birth_month);
    setImagePreview(record.photo);
    setRemoveCurrentImage(false);
    setIsEditDialogOpen(true);
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
    setSelectedMonth('');
    const fileInput = document.getElementById(
      'edit-photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle edit form submission
  const handleEditSubmit = async (values: EditFormValues) => {
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would upload the image and get a URL back
      let photoUrl = editingRecord.photo;

      // If user uploaded a new image
      if (values.photo) {
        // Simulate image upload and getting a URL back
        photoUrl = URL.createObjectURL(values.photo);
      }

      // If user removed the current image
      if (removeCurrentImage && !values.photo) {
        photoUrl = null;
      }

      // Update local state
      setBirthdayData((prev) =>
        prev.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                name: values.name,
                phone_number: values.phone_number,
                birth_month: values.birth_month,
                birth_day: values.birth_day,
                photo: photoUrl,
                updated_at: new Date(),
              }
            : record
        )
      );

      toast({
        title: 'Success!',
        description: 'Birthday record has been updated.',
      });

      handleEditDialogClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update birthday record. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBirthdayData((prev) => prev.filter((record) => record.id !== id));

      toast({
        title: 'Success!',
        description: 'Birthday record has been deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete birthday record. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Birthday
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No birthday records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {record.photo ? (
                        <Image
                          src={record.photo || '/placeholder.svg'}
                          alt={record.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>{record.phone_number}</TableCell>
                  <TableCell>
                    {formatBirthday(record.birth_month, record.birth_day)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the birthday record for{' '}
                              {record.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => !open && handleEditDialogClose()}
      >
        <DialogContent className="sm:max-w-[480px] md:max-w-[520px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Birthday Record</DialogTitle>
            <DialogDescription>
              Make changes to the birthday record here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-1 flex-1">
            <Form {...editForm}>
              <form
                id="edit-form"
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-5 pb-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="birth_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Month</FormLabel>
                        <Select
                          onValueChange={(value) => handleMonthChange(value)}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="birth_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Day</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!selectedMonth}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {days.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="photo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Photo (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="edit-photo-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG or JPEG (MAX. 5MB)
                                </p>
                              </div>
                              <input
                                id="edit-photo-upload"
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileChange}
                              />
                            </label>
                          </div>

                          {imagePreview && !removeCurrentImage && (
                            <div className="relative">
                              <div className="relative w-full h-56 rounded-lg overflow-hidden border">
                                <Image
                                  src={imagePreview || '/placeholder.svg'}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {imagePreview && removeCurrentImage && (
                            <div className="relative">
                              <div className="relative w-full h-56 rounded-lg overflow-hidden border">
                                <Image
                                  src={imagePreview || '/placeholder.svg'}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a photo for this birthday entry.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleEditDialogClose}
            >
              Cancel
            </Button>
            <Button type="submit" form="edit-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
