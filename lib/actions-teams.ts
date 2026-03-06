"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";

export async function createTeam(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user) {
    console.error('CreateTeam: User not authenticated');
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (user.role !== 'docente' && user.role !== 'admin') {
    console.error(`CreateTeam: User role ${user.role} not authorized`);
    return { success: false, error: 'No tienes permisos para crear equipos' };
  }

  const name = formData.get('name') as string;
  if (!name) return { success: false, error: 'El nombre es obligatorio' };

  try {
    await pb.collection('teams').create({ name, members: [] });
    revalidatePath('/teams');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create team:', error);
    // Return specific PocketBase error if available
    const message = error?.data?.message || error?.message || 'Error al crear el equipo en la base de datos';
    return { success: false, error: message };
  }
}

export async function deleteTeam(teamId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await pb.collection('teams').delete(teamId);
    revalidatePath('/teams');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete team:', error);
    return { success: false, error: 'Failed to delete team' };
  }
}

export async function updateTeamName(teamId: string, name: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await pb.collection('teams').update(teamId, { name });
    revalidatePath('/teams');
    return { success: true };
  } catch (error) {
    console.error('Failed to update team name:', error);
    return { success: false, error: 'Failed to update team name' };
  }
}

export async function moveStudentToTeam(studentId: string, targetTeamId: string | null) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Find if student is currently in any team
    // We filter teams where members contain the studentId
    const currentTeams = await pb.collection('teams').getFullList({
      filter: `members ~ "${studentId}"`,
    });

    // 2. Remove from current team(s)
    // Even if somehow in multiple (shouldn't happen), remove from all except target
    for (const team of currentTeams) {
      if (team.id === targetTeamId) continue; // Already in target, skip removal (though if we are here, logic suggests user moved explicitly)
      
      // Use array operations to remove
      await pb.collection('teams').update(team.id, {
        'members-': studentId
      });
    }

    // 3. Add to new team if targetTeamId is provided (not null/empty)
    if (targetTeamId) {
      // Check if already in target (optimization)
      const isAlreadyInTarget = currentTeams.some(t => t.id === targetTeamId);
      if (!isAlreadyInTarget) {
        await pb.collection('teams').update(targetTeamId, {
          'members+': studentId
        });
      }
    }

    revalidatePath('/teams');
    return { success: true };
  } catch (error) {
    console.error('Failed to move student:', error);
    return { success: false, error: 'Failed to move student' };
  }
}
