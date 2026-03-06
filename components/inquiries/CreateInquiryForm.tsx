"use client";

import { useState, useEffect } from "react";
import { createInquiry } from "@/lib/actions-inquiries";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Class, Assignment, Sprint } from "@/types";

interface CreateInquiryFormProps {
  initialClassId?: string;
  initialAssignmentId?: string;
  classes: Class[];
  assignments: Assignment[];
  sprints: Sprint[];
}

export default function CreateInquiryForm({ initialClassId, initialAssignmentId, classes, assignments, sprints }: CreateInquiryFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || "");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(initialAssignmentId || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize Sprint if Class or Assignment is pre-selected
  useEffect(() => {
    if (initialClassId) {
      const cls = classes.find(c => c.id === initialClassId);
      if (cls) setSelectedSprintId(cls.sprint);
    } else if (initialAssignmentId) {
      const asg = assignments.find(a => a.id === initialAssignmentId);
      if (asg) setSelectedSprintId(asg.sprint);
    }
  }, [initialClassId, initialAssignmentId, classes, assignments]);

  // Reset class/assignment if sprint changes
  useEffect(() => {
    // Only clear if the current selection doesn't belong to the new sprint
    // But simplified: clear if manually changed by user interaction (we can't easily distinguish here)
    // Better UX: If I change sprint, clear class/assignment selections to avoid inconsistency
    // However, the initial load useEffect above might conflict if we are not careful.
    // The initial load sets sprint based on class/assignment.
    // If I change sprint manually, I want to clear class/assignment.
    
    // Check if current selected class belongs to new sprint
    if (selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      if (cls && cls.sprint !== selectedSprintId) {
        setSelectedClassId("");
      }
    }
    
    if (selectedAssignmentId) {
      const asg = assignments.find(a => a.id === selectedAssignmentId);
      if (asg && asg.sprint !== selectedSprintId) {
        setSelectedAssignmentId("");
      }
    }
  }, [selectedSprintId, classes, assignments]);

  // Reset assignment if class is selected, and vice versa
  useEffect(() => {
    if (selectedClassId) setSelectedAssignmentId("");
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedAssignmentId) setSelectedClassId("");
  }, [selectedAssignmentId]);

  const cancelHref = initialClassId 
    ? `/classes/${initialClassId}` 
    : initialAssignmentId 
      ? `/assignments/${initialAssignmentId}` 
      : "/inquiries";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createInquiry({
      title,
      description,
      classId: selectedClassId || undefined,
      assignmentId: selectedAssignmentId || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      router.refresh();
      router.push(cancelHref);
    } else {
      alert(result.error || "Error al crear la consulta");
    }
  };

  // Filter classes and assignments based on selected Sprint
  const filteredClasses = selectedSprintId 
    ? classes.filter(c => c.sprint === selectedSprintId)
    : [];

  const filteredAssignments = selectedSprintId
    ? assignments.filter(a => a.sprint === selectedSprintId)
    : [];

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          required
          placeholder="Resumen breve de tu duda"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Sprint (Opcional - Filtra Clases y TPs)
        </label>
        <select
          value={selectedSprintId}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
        >
          <option value="">-- Seleccionar Sprint --</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        {!selectedSprintId && <p className="text-xs text-zinc-500 mt-1">Selecciona un Sprint para ver sus Clases y Trabajos Prácticos</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Relacionar con Clase (Opcional)
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            disabled={!!selectedAssignmentId || !selectedSprintId}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
          >
            <option value="">-- Ninguna --</option>
            {filteredClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {selectedAssignmentId && <p className="text-xs text-zinc-500 mt-1">Deshabilitado porque se seleccionó un Trabajo Práctico</p>}
          {!selectedSprintId && !selectedAssignmentId && <p className="text-xs text-zinc-500 mt-1">Selecciona un Sprint primero</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Relacionar con Trabajo Práctico (Opcional)
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            disabled={!!selectedClassId || !selectedSprintId}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
          >
            <option value="">-- Ninguno --</option>
            {filteredAssignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          {selectedClassId && <p className="text-xs text-zinc-500 mt-1">Deshabilitado porque se seleccionó una Clase</p>}
          {!selectedSprintId && !selectedClassId && <p className="text-xs text-zinc-500 mt-1">Selecciona un Sprint primero</p>}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          required
          placeholder="Describe tu consulta en detalle..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href={cancelHref}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Consulta"}
        </button>
      </div>
    </form>
  );
}
