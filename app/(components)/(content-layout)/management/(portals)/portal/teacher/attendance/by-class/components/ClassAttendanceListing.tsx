"use client";
import useSchoolStore from "../../../../../../store/school";
import { Class, Student, Subject, UserRole } from "../../../../../../types/types";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import { Card, CardContent } from "../../../../../../components/ui/card";

import { Button } from "../../../../../../components/ui/button";
import { getStudentsByClass } from "../../../../../../actions/students";
import { Calendar, Check, Clock, Loader2 } from "lucide-react";
import FormSelectInput from "../../../../../../components/FormInputs/FormSelectInput";
import { addDays, format, startOfWeek } from "date-fns";
import { toast } from "sonner";

import { Label } from "../../../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../components/ui/popover";
import { Calendar as CalendarComponent } from "../../../../../../components/ui/calendar";
import { Input } from "../../../../../../components/ui/input";
import { getAttendanceList } from "../../../../../../actions/attendance";
import AttendanceTable from "./AttendanceTable";
import { AttendanceData } from "../../../../../../types/attendance";

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
export default function ClassAttendanceListing({
  classes,
  role = "ADMIN",
}: {
  classes: Class[];
  role?: UserRole;
}) {
  const { school } = useSchoolStore();
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  // Class
  const [selectedDay, setSelectedDay] = useState<string>(weekDays[0].value); // Default to Monday
  const selectedDayName =
    weekDays.find((day) => day.value === selectedDay)?.name || "Monday";
  const classOptions = classes.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });

  const [selectedClass, setSelectedClass] = useState<any>(classOptions[0]);

  const classId = selectedClass?.value ?? "";
  const streams = classes.find((item) => item.id === classId)?.streams || [];
  // sections/Streams
  const streamsOptions = streams.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });

  streamsOptions.unshift({
    label: "All Streams",
    value: "all",
  });

  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function getStudentList() {
    setLoading(true);
    try {
      const streamId = selectedStream.value as string;
      const date =
        weekDays.find((day) => day.value === selectedDay)?.date || new Date();

      const attendanceList = await getAttendanceList(streamId, date);
      setAttendanceData(attendanceList);
      console.log(attendanceList);
      setLoading(false);
      // const students = await getStudentsByClass(data);
      // const formattedStudents: StudentWithAttendance[] = students.map((s) => {
      //   return {
      //     id: s.id,
      //     name: s.name,
      //     regNo: s.regNo,
      //     status: "not_marked",
      //   };
      // });
      // setStudents(formattedStudents);
      // setLoading(false);
      // console.log(students);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <div className="p-8 space-y-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-3">
            <FormSelectInput
              label="Class"
              options={classOptions}
              option={selectedClass}
              setOption={setSelectedClass}
            />
            <FormSelectInput
              label="Stream/Section"
              options={streamsOptions}
              option={selectedStream}
              setOption={setSelectedStream}
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
      {attendanceData && attendanceData.students.length > 0 ? (
        <>
          <Card className="p-6">
            <div className="flex flex-col space-y-4">
              <h3 className="text-2xl text-center font-semibold mb-2">
                Attendance for {selectedClass?.label} {selectedStream?.label} -{" "}
                {selectedDayName}
              </h3>

              <AttendanceTable data={attendanceData} />
            </div>
          </Card>
        </>
      ) : (
        <div className="">
          <h2>No data Found</h2>
        </div>
      )}
    </div>
  );
}
