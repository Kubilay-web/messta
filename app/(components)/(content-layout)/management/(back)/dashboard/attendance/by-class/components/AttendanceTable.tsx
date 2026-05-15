// components/SimpleAttendanceTable.tsx
import { AttendanceData, AttendanceStatus } from "../../../../../types/attendance";
import React from "react";

interface AttendanceTableProps {
  data: AttendanceData;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  // Status button component for displaying attendance status
  const StatusButton = ({ status }: { status: AttendanceStatus | null }) => {
    let bgColor = "bg-gray-200";
    let textColor = "text-gray-700";
    let statusText = "Not Set";

    if (status === "PRESENT") {
      bgColor = "bg-green-500";
      textColor = "text-white";
      statusText = "Present";
    } else if (status === "ABSENT") {
      bgColor = "bg-red-500";
      textColor = "text-white";
      statusText = "Absent";
    } else if (status === "EXCUSED") {
      bgColor = "bg-amber-400";
      textColor = "text-white";
      statusText = "Excused";
    }

    return (
      <div
        className={`px-4 py-1 rounded-full ${bgColor} ${textColor} inline-block text-center`}
      >
        {statusText}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left p-4 font-medium text-gray-500">Student</th>
            {data.headers.map((header) => (
              <th
                key={header.subjectId}
                className="p-4 text-center font-medium text-gray-500"
              >
                <div>
                  <div className="font-medium">{header.subjectName}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {header.startTime} - {header.endTime}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.students.map((student) => (
            <tr key={student.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-500">{student.regNo}</div>
              </td>

              {data.headers.map((header) => (
                <td
                  key={`${student.id}-${header.subjectId}`}
                  className="p-4 text-center"
                >
                  <StatusButton
                    status={
                      student.attendance[header.subjectId]?.status || null
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
