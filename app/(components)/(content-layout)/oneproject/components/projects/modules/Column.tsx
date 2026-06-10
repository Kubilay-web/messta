// import { DeleteTask } from "../../../components/Forms/DeleteTask";
// import TaskForm from "../../../components/Forms/TaskForm";
// import { ScrollArea } from "../../../components/ui/scroll-area";
// import { cn } from "@/app/lib/utils";
// import { Task } from "../../../types/types";
// import { useDroppable } from "@dnd-kit/core";
// import { TaskStatus } from "@prisma/client";
// import React from "react";
// import DraggableItem from "./DraggableItem";

// export default function Column({
//   tasks,
//   status,
//   moduleId,
//   activeId,
// }: {
//   tasks: Task[];
//   status: TaskStatus;
//   moduleId: string;
//   activeId: string | null;
// }) {
//   const { setNodeRef } = useDroppable({
//     id: status,
//   });
//   return (
//     <div className="rounded-tl-lg rounded-tr-lg  border overflow-hidden">
//       <div
//         className={cn(
//           "flex flex-row items-center justify-between space-y-0  px-3 ",
//           status === "TODO"
//             ? "bg-orange-50"
//             : status === "INPROGRESS"
//             ? "bg-blue-50"
//             : "bg-green-50"
//         )}
//       >
//         <h2 className="text-sm font-bold">
//           {status
//             .split("-")
//             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(" ")}
//         </h2>
//         <div className="flex items-center space-x-2">
//           <TaskForm moduleId={moduleId} initialStatus={status} />
//         </div>
//       </div>
//       <div className="px-2">
//         <ScrollArea ref={setNodeRef} className="h-[calc(100vh-16rem)]">
//           {tasks
//             .filter((task) => task.status === status)
//             .map((task) => (
//               <DraggableItem
//                 key={task.id}
//                 id={task.id}
//                 task={task}
//                 isDragging={activeId === task.id}
//               />
//             ))}
//         </ScrollArea>
//       </div>
//     </div>
//   );
// }

"use client";
import React from "react";
import { Task } from "../../../types/types";
import TaskCard from "./TaskCard";
import TaskForm from "../../Forms/TaskForm";

export default function Column({
  tasks,
  status,
  moduleId,
  onTaskUpdate,
}: {
  tasks: Task[];
  status: string;
  moduleId: string;
  onTaskUpdate: (task: Task) => void;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        status === "TODO"
          ? "bg-orange-50"
          : status === "INPROGRESS"
            ? "bg-blue-50"
            : "bg-green-50"
      }`}
    >
      <div className="flex justify-between items-center px-3 py-2">
        <h2 className="text-sm font-bold">
          {status
            .split("-")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" ")}
        </h2>
        <TaskForm moduleId={moduleId} initialStatus={status} />
      </div>
      <div className="px-2 py-1 space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
          ))
        ) : (
          <p className="text-gray-400 text-sm p-2">No tasks</p>
        )}
      </div>
    </div>
  );
}
