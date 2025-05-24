'use client';

import type React from 'react';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  phone_number: z.string().min(1, {
    message: 'Phone number is required.',
  }),
  birth_month: z.string().min(1, {
    message: 'Birth month is required.',
  }),
  birth_day: z.string().min(1, {
    message: 'Birth day is required.',
  }),
  photo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function BirthdayForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
    form.setValue('birth_month', month);

    // Reset day if it's invalid for the new month
    const currentDay = form.getValues('birth_day');
    const daysInNewMonth = getDaysInMonth(month).length;

    if (currentDay && Number.parseInt(currentDay) > daysInNewMonth) {
      form.setValue('birth_day', '');
    }
  };

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

      form.setValue('photo', file);

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
    form.setValue('photo', undefined);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById(
      'photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Form submission handler
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      let phone_number = values.phone_number;
      // Create FormData for file upload
      phone_number = phone_number.startsWith('234')
        ? phone_number
        : phone_number.startsWith('+234')
        ? phone_number.replace(/^\+/, '')
        : phone_number.startsWith('0')
        ? phone_number.replace(/^0/, '234')
        : '234' + phone_number;

      const { birth_month, birth_day } = values;

      const birth_date = new Date(
        2000,
        parseInt(birth_month),
        parseInt(birth_day)
      );

      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('birthday_date', birth_date.toISOString());
      formData.append('profile_picture', values.photo as File);
      formData.append('phoneNumber', phone_number);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/birthday`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to add birthday entry');
      }
      // Handle successful submission

      // Show success toast
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Birthday entry has been added.',
      });

      // Reset form and preview
      form.reset();
      setImagePreview(null);
      setSelectedMonth('');
      const fileInput = document.getElementById(
        'photo-upload'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add birthday entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  // Reset form handler
  function handleReset() {
    form.reset({
      name: '',
      phone_number: '',
      birth_month: '',
      birth_day: '',
      photo: undefined,
    });
    setImagePreview(null);
    setSelectedMonth('');
    const fileInput = document.getElementById(
      'photo-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  return (
    <div className="max-w-md mx-auto bg-card rounded-lg border p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Add New Birthday</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
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
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormDescription>
                  This must be unique and will be used for identification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="birth_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Month</FormLabel>
                  <Select
                    onValueChange={(value) => handleMonthChange(value)}
                    defaultValue={field.value}
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
              control={form.control}
              name="birth_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Day</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
            control={form.control}
            name="photo"
            render={() => (
              <FormItem>
                <FormLabel>Photo (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="photo-upload"
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
                          id="photo-upload"
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
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

          <div className="flex gap-4 pt-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
