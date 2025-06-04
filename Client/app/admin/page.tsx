"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import BirthdayAdmin from "@/components/birthday-admin";
import { Session } from "@/lib/auth";

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

export default function AdminPage() {
  const router = useRouter();
  const [records, setRecords] = useState<ClassMateProps[]>([]);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session) return;
    if (session.user.name !== "Admin") {
      router.replace("/");
      return;
    }
    const fetchRecords = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/birthday`);
        if (!res.ok) throw new Error("Failed to fetch birthday records");
        const data: ClassMateProps[] = await res.json();
        setRecords(data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };
    fetchRecords();
  }, [isPending, session?.user?.name, router]); // only include what you need and what’s stable

  if (isPending || !session) return null;

  return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Birthday Records Admin</h1>
        <BirthdayAdmin records={records} />
      </div>
  );
}
