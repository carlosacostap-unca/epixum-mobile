"use client";
import { useState } from 'react';
import { createTeam } from '@/lib/actions-teams';

export function CreateTeamForm() {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if(!name.trim()) return;
        
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('name', name);
        
        try {
            const result = await createTeam(formData);
            if (!result.success) {
                setError(result.error || "Error desconocido al crear el equipo");
            } else {
                setName("");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mb-6 max-w-md">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                    name="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre del nuevo equipo"
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium whitespace-nowrap"
                >
                    {isLoading ? "Creando..." : "Crear Equipo"}
                </button>
            </form>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    )
}
