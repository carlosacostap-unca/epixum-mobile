import { redirect } from "next/navigation";

export default async function LegacyExamSimulationsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  redirect(`/parciales/${examId}/resultados`);
}
