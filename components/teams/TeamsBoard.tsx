"use client";
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Team, User } from '@/types';
import { TeamColumn } from './TeamColumn';
import { StudentItem } from './StudentItem';
import { CreateTeamForm } from './CreateTeamForm';
import { moveStudentToTeam } from '@/lib/actions-teams';

interface TeamsBoardProps {
  initialTeams: Team[];
  allStudents: User[];
}

export default function TeamsBoard({ initialTeams, allStudents }: TeamsBoardProps) {
  // Map of ContainerID -> StudentIDs
  const [items, setItems] = useState<Record<string, string[]>>({});
  // Map of StudentID -> Student Object (for rendering)
  const [studentsMap, setStudentsMap] = useState<Record<string, User>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize state from props
  useEffect(() => {
    const newItems: Record<string, string[]> = {};
    const newStudentsMap: Record<string, User> = {};

    // 1. Map all students
    allStudents.forEach(s => {
        newStudentsMap[s.id] = s;
    });
    setStudentsMap(newStudentsMap);

    // 2. Map teams
    const assignedStudentIds = new Set<string>();
    initialTeams.forEach(team => {
        newItems[team.id] = team.members; 
        team.members.forEach(id => assignedStudentIds.add(id));
    });

    // 3. Map unassigned
    newItems['unassigned'] = allStudents
        .filter(s => !assignedStudentIds.has(s.id))
        .map(s => s.id);

    setItems(newItems);
  }, [initialTeams, allStudents]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) {
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(active.id as string);
      const overIndex = overItems.indexOf(overId as string);

      let newIndex;
      if (overId in prev) {
        // We're over a container
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          active.id as string,
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    
    // Find where the item ended up in our state (it was moved by handleDragOver)
    const containerId = findContainer(activeId);

    if (containerId) {
        const targetTeamId = containerId === 'unassigned' ? null : containerId;
        // Only call server if we actually need to (though safe to call always)
        // We could compare with initial state but that's complex. 
        // Just calling it is fine, the action handles "already in team" check efficiently.
        await moveStudentToTeam(activeId, targetTeamId);
    }

    setActiveId(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
        <div className="flex flex-col h-full">
            <CreateTeamForm />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 items-start w-full">
                {/* Unassigned Column */}
                <div className="h-full">
                    <TeamColumn 
                        id="unassigned"
                        name="Sin Asignar"
                        members={items['unassigned'] || []}
                        students={studentsMap}
                        isUnassigned={true}
                    />
                </div>

                {/* Teams Columns */}
                {initialTeams.map((team) => (
                    <div key={team.id} className="h-full">
                        <TeamColumn 
                            id={team.id}
                            name={team.name}
                            members={items[team.id] || []}
                            students={studentsMap}
                        />
                    </div>
                ))}
            </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? <StudentItem student={studentsMap[activeId]} /> : null}
        </DragOverlay>
    </DndContext>
  );
}
