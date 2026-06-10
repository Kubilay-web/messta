import React, { useEffect, useState } from "react";
import { Row } from "@tanstack/react-table";
import { Project } from "@prisma/client";

interface ProjectDeadlineProps {
  row: Row<Project>;
}

export default function ProjectDeadline({ row }: ProjectDeadlineProps) {
  const projectData = row.original;

  function calculateDaysDifference(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  function formatTimeDifference(days: number): string {
    const absDay = Math.abs(days);
    const years = Math.floor(absDay / 365);
    const remainingDays = absDay % 365;

    let result = "";
    if (years > 0) {
      result += `${years} year${years !== 1 ? "s" : ""}`;
      if (remainingDays > 0) {
        result += ` and ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
      }
    } else {
      result = `${absDay} day${absDay !== 1 ? "s" : ""}`;
    }

    if (days > 0) {
      return `${result}`;
    } else if (days < 0) {
      return `${result} past`;
    } else {
      return "Deadline";
    }
  }
  const [daysDifference, setDaysDifference] = useState(0);
  useEffect(() => {
    // Calculate initial days difference
    if (projectData.endDate) {
      setDaysDifference(calculateDaysDifference(projectData.endDate));
    }

    // Set up an interval to update days difference every day
    const intervalId = setInterval(() => {
      if (projectData.endDate) {
        setDaysDifference(calculateDaysDifference(projectData.endDate));
      }
    }, 24 * 60 * 60 * 1000); // Update every 24 hours

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [projectData.endDate]);

  return (
    <div
      className={`text-sm font-medium ${
        daysDifference < 0 ? "text-red-600" : "text-green-600"
      }`}
    >
      {projectData.endDate ? formatTimeDifference(daysDifference) : "Ongoing"}
    </div>
  );
}
