import BirthdayForm from "@/components/birthday-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Birthday Registry</h1>
        <Link href="/admin">
          <Button variant="outline">Admin Panel</Button>
        </Link>
      </div>
      <BirthdayForm />
    </main>
  )
}
