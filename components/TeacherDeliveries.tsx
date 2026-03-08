"use client";

import { Delivery } from "@/types";
import { useState } from "react";
import { getDeliveryDownloadUrl } from "@/lib/actions";

interface TeacherDeliveriesProps {
  deliveries: Delivery[];
  assignmentId: string;
}

export default function TeacherDeliveries({ deliveries, assignmentId }: TeacherDeliveriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL?.replace(/\/$/, "") || "";

  const handleDownload = async (deliveryId: string) => {
    setDownloadingId(deliveryId);
    try {
        const result = await getDeliveryDownloadUrl(deliveryId);
        if (result.success && result.url) {
            window.open(result.url, '_blank');
        } else {
            alert(result.error || "No se pudo obtener el enlace de descarga");
        }
    } catch (err) {
        console.error(err);
        alert("Error al intentar descargar el archivo");
    } finally {
        setDownloadingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const student = delivery.expand?.student;
    const studentName = student?.name || "Estudiante desconocido";
    const studentEmail = student?.email || "Sin email";
    
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="p-1 bg-blue-100 dark:bg-blue-900 rounded-md">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </span>
        Entregas ({deliveries.length})
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="bg-zinc-50 dark:bg-zinc-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                Estudiante
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                Archivo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery) => {
                const student = delivery.expand?.student;
                const studentName = student?.name || "Estudiante desconocido";
                const studentEmail = student?.email || "Sin email";
                
                return (
                <tr key={delivery.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-zinc-500 dark:text-zinc-300 overflow-hidden">
                         {student?.avatar ? (
                            <img 
                              src={`${pbUrl}/api/files/${student.collectionId}/${student.id}/${student.avatar}`} 
                              alt={studentName} 
                              className="h-full w-full object-cover" 
                            />
                         ) : (
                            <span className="font-bold text-xs">
                                {studentName.charAt(0) || "?"}
                            </span>
                         )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {studentName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDownload(delivery.id)}
                      disabled={downloadingId === delivery.id}
                      className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {downloadingId === delivery.id ? (
                        <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1"></span>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9V3.5L18.5 9M6 2c-1.11 0-1.99.89-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6z"/></svg>
                      )}
                      Descargar ZIP
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(delivery.created).toLocaleDateString()}
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No hay entregas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
