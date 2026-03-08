"use client";

import AssignmentForm from "@/components/AssignmentForm";
import { useRouter } from "next/navigation";

export default function AssignmentFormWrapper() {
  const router = useRouter();

  return (
    <AssignmentForm 
      isEmbedded={true}
      onClose={() => {
        router.push("/assignments");
        router.refresh();
      }} 
    />
  );
}
