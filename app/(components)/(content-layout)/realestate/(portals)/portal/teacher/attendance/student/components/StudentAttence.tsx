// components/StudentAttendanceTable.tsx
import {
  AttendanceStatus,
  StudentAttendanceData,
} from "../../../../../../types/studentAttendance";
import React from "react";

interface StudentAttendanceTableProps {
  data: StudentAttendanceData;
}

const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  data,
}) => {
  // Helper to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Component for attendance status badge
  const AttendanceStatusBadge = ({
    status,
  }: {
    status: AttendanceStatus | null;
  }) => {
    let bgColor = "bg-gray-200";
    let textColor = "text-gray-700";
    let statusText = "Not Set";

    if (status === AttendanceStatus.PRESENT) {
      bgColor = "bg-green-500";
      textColor = "text-white";
      statusText = "Present";
    } else if (status === AttendanceStatus.ABSENT) {
      bgColor = "bg-red-500";
      textColor = "text-white";
      statusText = "Absent";
    } else if (status === AttendanceStatus.EXCUSED) {
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

  // If there's no subject data, show a message
  if (!data.subjects || data.subjects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{data.student.name}</h2>
          <p className="text-gray-600">{data.student.regNo}</p>
          <p className="text-gray-600">{formatDate(data.date)}</p>
        </div>
        <div className="text-center py-8 text-gray-500">
          No attendance records found for this date.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{data.student.name}</h2>
        <p className="text-gray-600">{data.student.regNo}</p>
        <p className="text-gray-600">{formatDate(data.date)}</p>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Subject
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Time
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Class
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Note
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.subjects.map((subject) => (
            <tr key={subject.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {subject.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {subject.startTime} - {subject.endTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {subject.className} ({subject.streamName})
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <AttendanceStatusBadge status={subject.attendance.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {subject.attendance.note || "-"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-end space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceTable;
