'use client';

import React, {useEffect} from 'react';

import { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { toast } from "sonner"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ClassMateProps } from '@/app/admin/page';
import Link from "next/link";
import {authClient} from "@/lib/auth";
import {useRouter} from "next/navigation"

const editFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }).optional(),
  phoneNumber: z.string().min(1, {
    message: 'Phone number is required.',
  }).optional(),
  birth_month: z.string().min(1, {
    message: 'Birth month is required.',
  }).optional(),
  birth_day: z.string().min(1, {
    message: 'Birth day is required.',
  }).optional(),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender option.",
  }).optional(),
  photo: z.instanceof(File, {message: "File required"}).optional(),
});

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]

type EditFormValues = z.infer<typeof editFormSchema>;

export default function BirthdayAdmin({ records }: { records: ClassMateProps[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [birthdayData, setBirthdayData] = useState(records);
  const [editingRecord, setEditingRecord] = useState<ClassMateProps | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const router = useRouter();
  // Edit form
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      birth_month: '',
      birth_day: '',
      gender: 'male',
      photo: new File([], ''),
    },
  });

  useEffect(() => {
    setBirthdayData(records);
  }, [records]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return birthdayData;

    return birthdayData.filter(
      (record) =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [birthdayData, searchTerm]);

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast('Invalid file type',{
          description: 'Please select a .jpg, .jpeg, or .png file.',
          closeButton: true,
        });
        return;
      }

      // Validate file size (optional - 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast('File too large',{
          description: 'Please select an image smaller than 5MB.',
          closeButton: true,
        });
        return;
      }
      
      editForm.setValue('photo', file);
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
    setImagePreview(null);
    setRemoveCurrentImage(true);
    // Reset file input
    const fileInput = document.getElementById(
      'edit-photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };



  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
    const fileInput = document.getElementById(
      'edit-photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

    // Handle edit
    const handleEdit = (record: ClassMateProps) => {
      setEditingRecord(record);
      editForm.reset({
        name: record.name,
        phoneNumber: record.phoneNumber,
        birth_month: new Date(record.birthdayDate).getMonth() + 1 + '',
        birth_day: new Date(record.birthdayDate).getDate() + '',
        gender: record.gender,
        photo: new File([], ''),
      });
      setImagePreview(record.profileUrl);
      setRemoveCurrentImage(false);
      setIsEditDialogOpen(true);
    };

  // Handle edit form submission
  const handleEditSubmit = async (values: EditFormValues) => {
    if (!editingRecord) return;
  
    const previousData = birthdayData;
    setIsSubmitting(true);
  
    // Create form data only with changed fields
    const formData = new FormData();
    
    // Only append fields that have changed
    if (values.name && values.name !== editingRecord.name) {
      formData.append("name", values.name);
    }
    
    if (values.phoneNumber && values.phoneNumber !== editingRecord.phoneNumber) {
      formData.append("phoneNumber", values.phoneNumber);
    }
    
    if (values.birth_month && values.birth_day) {
      const updatedBirthdayDate = new Date(2000, parseInt(values.birth_month) - 1, parseInt(values.birth_day), 12, 0 , 0);
      const currentBirthday = new Date(editingRecord.birthdayDate);
      if (updatedBirthdayDate.getMonth() !== currentBirthday.getMonth() || 
          updatedBirthdayDate.getDate() !== currentBirthday.getDate()) {
        formData.append("birthday_date", updatedBirthdayDate.toISOString());
      }
    }
    
    if (values.gender && values.gender !== editingRecord.gender) {
      formData.append("gender", values.gender);
    }
    
    if (values.photo && values.photo.size > 0) {
      formData.append("profile_picture", values.photo as File);
    }


    // Only proceed if there are changes
    if (formData.entries().next().done) {
      toast('No changes',{
        description: 'No changes were made to the record.',
        closeButton: true,
      });
      handleEditDialogClose();
      setIsSubmitting(false);
      return;
    }

    // Optimistically update UI
    setBirthdayData((prev) =>
      prev.map((record) =>
        record.id === editingRecord.id
          ? {
              ...record,
              ...(values.name && { name: values.name }),
              ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
              ...(values.birth_month && values.birth_day && {
                birthdayDate: new Date(2000, parseInt(values.birth_month) - 1, parseInt(values.birth_day), 12, 0 , 0)
              }),
              ...(values.gender && { gender: values.gender }),
              ...(imagePreview && { profileUrl: imagePreview }),
              updatedAt: new Date(),
            }
          : record
      )
    );

    handleEditDialogClose();
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/birthday/${editingRecord.id}`, {
        method: "PUT",
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error("Update failed");
      }
  
      toast('Success!',{
        description: 'Birthday record has been updated.',
        closeButton: true,
      });
  
    } catch (error) {
      // Rollback
      setBirthdayData(previousData);
      toast('Error',{
        description: 'Failed to update birthday record. Please try again.',
        closeButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Handle delete
  const handleDelete = async (id: string) => {
    // Optimistically update UI
    const previousData = birthdayData;
    setBirthdayData((prev) => prev.filter((record) => record.id !== id));
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/birthday/${id}`, {
        method: "DELETE"
      });
  
      if (!res.ok) {
        throw new Error("Delete request failed");
      }
  
      toast('Success!',{
        description: 'Birthday record has been deleted.',
        closeButton: true,
      });
    } catch (error) {
      // Rollback if it fails
      setBirthdayData(previousData);
      toast("Error", {
        description: 'Failed to delete birthday record. Please try again.',
        closeButton: true,
      });
    }
  };
  
  // Format birthday date for display
  const formatBirthdayDisplay = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
        onError: (error) => {
          console.log("error signing out", error);
        }
      },
    });
  }

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
        <div className={"flex items-center gap-3"}>
        <Link href={"/"} className={"flex space-x-2 py-2.5 px-4 bg-black text-white rounded-lg items-center"}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Birthday
        </Link>
        <Button onClick={signOut}>Log Out</Button>
        </div>
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
              <TableHead>Gender</TableHead>
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
                      {record.profileUrl ? (
                        <Image
                          src={record.profileUrl}
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
                  <TableCell>{record.phoneNumber}</TableCell>
                  <TableCell>
                    {formatBirthdayDisplay(record.birthdayDate)}
                  </TableCell>
                  <TableCell className="capitalize">{record.gender}</TableCell>
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
                  name="phoneNumber"
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
                        <FormControl>
                          <Input type="number" min="1" max="12" placeholder="1-12" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="number" min="1" max="31" placeholder="1-31" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {genderOptions.map((option) => (
                            <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option.value} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                          {imagePreview && (
                            <div className="relative">
                              <div className="relative w-full h-56 rounded-lg overflow-hidden border">
                                <Image
                                  src={imagePreview}
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
