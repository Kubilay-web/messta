"use client";
import React, { useState } from "react";
import { Task } from "../../../types/types";
import { TaskStatus } from "@prisma/client";
import TaskForm from "../../../components/Forms/TaskForm";
import { DeleteTask } from "../../../components/Forms/DeleteTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";

export default function TaskCard({
  task,
  onTaskUpdate,
}: {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}) {
  const [status, setStatus] = useState<TaskStatus>(task.status);



  const handleStatusChange = async (newStatus: TaskStatus) => {
  try {
    const res = await fetch(`/api/oneproject/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update task");

    const updatedTask = await res.json();
    setStatus(updatedTask.status);
    onTaskUpdate(updatedTask);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="bg-white rounded-md shadow p-3 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium line-clamp-1">{task.title}</p>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          className="mt-1 border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="TODO">TODO</option>
          <option value="INPROGRESS">INPROGRESS</option>
          <option value="COMPLETE">COMPLETE</option>
        </select>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white text-black" align="end">
          <DropdownMenuItem asChild>
            <TaskForm
              moduleId={task.moduleId}
              initialStatus={task.status}
              initialTitle={task.title}
              editingId={task.id}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <DeleteTask id={task.id} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}