"use client";
import useSchoolStore from "../../../../../store/school";
import { Class, Student, Subject, UserRole } from "../../../../../types/types";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Card, CardContent } from "../../../../../components/ui/card";

import { Button } from "../../../../../components/ui/button";
import { getStudentsByClass } from "../../../../../actions/students";
import { Calendar, Check, Clock, Loader2 } from "lucide-react";
import FormSelectInput from "../../../../../components/FormInputs/FormSelectInput";
import { addDays, format, startOfWeek } from "date-fns";
import { Label } from "../../../../../components/ui/label";
// import {
//   getAttendanceByStreamId,
//   getStudentAttendanceByDate,
// } from "../../../../../actions/attendance";

import { getStudentAttendanceList } from "../../../../../actions/attendance";

// import AttendanceTable from "./AttendanceTable";
import { AttendanceData } from "../../../../../types/attendance";
import { StudentAttendanceData } from "../../../../../types/studentAttendance";
import StudentAttendanceTable from "./StudentAttence";

export type StudentByClassProps = {
  classId: string;
  streamId: string;
  schoolId: string;
  date: Date;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "not_marked";

export interface StudentWithAttendance {
  id: string;
  name: string;
  regNo: string;
  status: AttendanceStatus;
}
type BriefStudent = {
  id: string;
  name: string;
  regNo: string;
};
// Generate days of current week
const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const day = addDays(startOfCurrentWeek, i);
  return {
    date: day,
    name: format(day, "EEEE"), // Monday, Tuesday, etc.
    value: format(day, "yyyy-MM-dd"),
  };
});
export default function StudentView({
  students,
  role = "ADMIN",
}: {
  students: BriefStudent[];
  role?: UserRole;
}) {
  const { school } = useSchoolStore();
  const [studentData, setStudentData] = useState<StudentAttendanceData | null>(
    null,
  );
  // Class
  const [selectedDay, setSelectedDay] = useState<string>(weekDays[0].value); // Default to Monday
  const selectedDayName =
    weekDays.find((day) => day.value === selectedDay)?.name || "Monday";
  const studentOptions = students.map((item) => {
    return {
      label: `${item.name}-${item.regNo}`,
      value: item.id,
    };
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(
    studentOptions[0],
  );

  const [loading, setLoading] = useState(false);

  async function getStudentList() {
    setLoading(true);
    try {
      const studentId = selectedStudent.value as string;
      const date =
        weekDays.find((day) => day.value === selectedDay)?.date || new Date();
      console.log(studentId, date);
      const data = await getStudentAttendanceList(studentId, date);
      setStudentData(data);
      // console.log(attendanceList);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <div className="p-8 space-y-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            <FormSelectInput
              label="Student/Select"
              options={studentOptions}
              option={selectedStudent}
              setOption={setSelectedStudent}
            />

            <div className="">
              <Label className="mb-3 pb-3 " htmlFor="day-select">
                Select Day
              </Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="day-select">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black">
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.name} ({format(day.date, "MMM d")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <Button disabled>
              <Loader2 className="animate-spin" />
              Fetching Please wait...
            </Button>
          ) : (
            <Button onClick={getStudentList}>Get Student List</Button>
          )}
        </CardContent>
      </Card>
      {/* {studentData && studentData.subjects.length > 0 ? (
        <>
          <Card className="p-6">
            <div className="flex flex-col space-y-4">
              <h3 className="text-2xl text-center font-semibold mb-2">
                Attendance for {selectedStudent?.label} - {selectedDayName}
              </h3>

              <StudentAttendanceTable data={studentData} />
            </div>
          </Card>
        </>
      ) : (
        <div className="">
          <h2>No data Found</h2>
        </div>
      )} */}

      {studentData ? (
        <Card className="p-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-2xl text-center font-semibold mb-2">
              Attendance for {selectedStudent?.label} - {selectedDayName}
            </h3>
            <StudentAttendanceTable data={studentData} />
          </div>
        </Card>
      ) : (
        <div>
          <h2>No data Found</h2>
        </div>
      )}
    </div>
  );
}
