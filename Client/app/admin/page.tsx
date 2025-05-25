import BirthdayAdmin from '@/components/birthday-admin';

export interface ClassMateProps {
  id: string;
  name: string;
  phoneNumber: string;
  birthdayDate: Date;
  profileUrl: string;
  gender: "male" | "female";
  createdAt: Date;
  updatedAt: Date;
}

export default async function AdminPage() {
  const getBirthdayRecords = async (): Promise<ClassMateProps[]> => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/birthday`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch birthday records');
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching birthday records:', error);
      return [];
    }
  };

  const birthdayRecords = await getBirthdayRecords();

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Birthday Records Admin</h1>
      <BirthdayAdmin records={birthdayRecords} />
    </div>
  );
}
