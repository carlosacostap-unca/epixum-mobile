"use client";

import { useState } from "react";
import { Delivery } from "@/types";
import { evaluateDelivery } from "@/lib/actions";

interface EvaluateDeliveryModalProps {
  delivery: Delivery;
  assignmentId: string;
  onClose: () => void;
}

export default function EvaluateDeliveryModal({ delivery, assignmentId, onClose }: EvaluateDeliveryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("assignmentId", assignmentId);

    try {
      const result = await evaluateDelivery(delivery.id, formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Ocurrió un error al evaluar la entrega");
      }
    } catch (err) {
      setError("Error al enviar la evaluación");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = delivery.expand?.student?.name || "Estudiante desconocido";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          Evaluar entrega de {studentName}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="verdict" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Veredicto *
            </label>
            <select
              id="verdict"
              name="verdict"
              required
              defaultValue={delivery.verdict || "Pendiente"}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rehacer">Rehacer</option>
              <option value="Desaprobado">Desaprobado</option>
            </select>
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nota (opcional)
            </label>
            <input
              type="text"
              id="grade"
              name="grade"
              defaultValue={delivery.grade || ""}
              placeholder="Ej: 8, 10, A+"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Feedback (opcional)
            </label>
            <textarea
              id="feedback"
              name="feedback"
              rows={4}
              defaultValue={delivery.feedback || ""}
              placeholder="Escribe tus comentarios para el estudiante..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Guardando...
                </>
              ) : (
                "Guardar Evaluación"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
