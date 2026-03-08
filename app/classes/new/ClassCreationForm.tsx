"use client";

import ClassForm from "@/components/ClassForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClassCreationForm() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/classes");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/classes" className="text-blue-500 hover:underline inline-block">&larr; Volver a Clases</Link>
      </div>
      <div className="flex justify-center">
        <ClassForm onClose={handleClose} />
      </div>
    </div>
  );
}
