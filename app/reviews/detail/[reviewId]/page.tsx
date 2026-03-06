import { getReview } from "@/lib/actions-reviews";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { notFound, redirect } from "next/navigation";
import FormattedDate from "@/components/FormattedDate";
import Link from "next/link";
import ReviewNotesForm from "@/components/reviews/ReviewNotesForm";

interface PageProps {
  params: Promise<{ reviewId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ReviewDetailPage({ params }: PageProps) {
  const { reviewId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getReview(reviewId);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const review = result.data;
  const isTeacher = user.role === 'docente' || user.role === 'admin';
  const isStudent = user.role === 'estudiante';
  
  // Access control
  if (isStudent && review.student !== user.id) {
    // Students can only view their own reviews
    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
            <p className="mt-4">No tienes permiso para ver este turno.</p>
            <Link href="/reviews" className="mt-8 inline-block text-blue-600 hover:underline">
                Volver a mis revisiones
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl min-h-screen">
      <div className="mb-8">
        <Link 
            href={`/reviews/${review.sprint}`}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al listado
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Detalle del Turno</h1>
        <div className="flex items-center gap-2 text-zinc-500">
            <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                Sprint: {review.expand?.sprint?.title || 'Desconocido'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-bold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Información</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase font-bold mb-1">Fecha y Hora</label>
                        <div className="font-medium">
                            <FormattedDate date={review.startTime} showTime={true} />
                            <div className="text-zinc-400 text-sm mt-1">
                                hasta <FormattedDate date={review.endTime} showTime={true} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 uppercase font-bold mb-1">Docente</label>
                        <div className="flex items-center gap-2">
                            {review.expand?.teacher?.avatar ? (
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${review.expand.teacher.id}/${review.expand.teacher.avatar}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                    alt="" 
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                    <span className="text-xs font-bold">{review.expand?.teacher?.name?.charAt(0) || 'D'}</span>
                                </div>
                            )}
                            <span>{review.expand?.teacher?.name || 'Docente'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-500 uppercase font-bold mb-1">Estudiante</label>
                        {review.student ? (
                            <div className="flex items-center gap-2">
                                {review.expand?.student?.avatar ? (
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${review.expand.student.id}/${review.expand.student.avatar}`}
                                        className="w-8 h-8 rounded-full object-cover"
                                        alt="" 
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                                        <span className="text-xs font-bold">{review.expand?.student?.name?.charAt(0) || 'E'}</span>
                                    </div>
                                )}
                                <span>{review.expand?.student?.name || 'Estudiante'}</span>
                            </div>
                        ) : (
                            <span className="text-zinc-400 italic">Sin reservar</span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Notes Section */}
        <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {isTeacher ? (
                    <ReviewNotesForm review={review} />
                ) : (
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            Retroalimentación
                        </h2>
                        
                        {review.public_note ? (
                            <div className="prose dark:prose-invert max-w-none bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <p className="whitespace-pre-wrap">{review.public_note}</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 italic">
                                No hay retroalimentación disponible todavía.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
