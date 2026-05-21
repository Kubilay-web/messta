// "use client";
// import useSchoolStore from "../../../../../../store/school";
// import { Class, Student, Subject, UserRole } from "../../../../../../types/types";
// import React, { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../../../../../components/ui/select";
// import { Card, CardContent } from "../../../../../../components/ui/card";

// import { Button } from "../../../../../../components/ui/button";
// import { getStudentsByClass } from "../../../../../../actions/students";
// import { Calendar, Check, Clock, Loader2 } from "lucide-react";
// import FormSelectInput from "../../../../../../components/FormInputs/FormSelectInput";
// import { addDays, format, startOfWeek } from "date-fns";
// import { Label } from "../../../../../../components/ui/label";
// import {
//   getAttendanceList,
//   getStudentAttendanceList
// } from "../../../../../../actions/attendance";
// // import AttendanceTable from "./AttendanceTable";
// import { AttendanceData } from "../../../../../../types/attendance";
// import { StudentAttendanceData } from "../../../../../../types/studentAttendance";
// import StudentAttendanceTable from "./StudentAttence";

// export type StudentByClassProps = {
//   classId: string;
//   streamId: string;
//   schoolId: string;
//   date: Date;
// };

// export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "not_marked";

// export interface StudentWithAttendance {
//   id: string;
//   name: string;
//   regNo: string;
//   status: AttendanceStatus;
// }
// type BriefStudent = {
//   id: string;
//   name: string;
//   regNo: string;
// };
// // Generate days of current week
// const today = new Date();
// const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
// const weekDays = Array.from({ length: 7 }, (_, i) => {
//   const day = addDays(startOfCurrentWeek, i);
//   return {
//     date: day,
//     name: format(day, "EEEE"), // Monday, Tuesday, etc.
//     value: format(day, "yyyy-MM-dd"),
//   };
// });
// export default function StudentView({
//   students,
//   role = "ADMIN",
// }: {
//   students: BriefStudent[];
//   role?: UserRole;
// }) {
//   const { school } = useSchoolStore();
//   const [studentData, setStudentData] = useState<StudentAttendanceData | null>(
//     null
//   );
//   // Class
//   const [selectedDay, setSelectedDay] = useState<string>(weekDays[0].value); // Default to Monday
//   const selectedDayName =
//     weekDays.find((day) => day.value === selectedDay)?.name || "Monday";
//   const studentOptions = students.map((item) => {
//     return {
//       label: `${item.name}-${item.regNo}`,
//       value: item.id,
//     };
//   });

//   const [selectedStudent, setSelectedStudent] = useState<any>(
//     studentOptions[0]
//   );

//   const [loading, setLoading] = useState(false);

//   async function getStudentList() {
//     setLoading(true);
//     try {
//       const studentId = selectedStudent.value as string;
//       const date =
//         weekDays.find((day) => day.value === selectedDay)?.date || new Date();
//       console.log(studentId, date);
//       const data = await getStudentAttendanceList(studentId, date);
//       setStudentData(data);
//       // console.log(attendanceList);
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   }
//   return (
//     <div className="p-1 space-y-6">
//       <Card className="border-t-4 border-blue-600 shadow">
//         <CardContent className="p-6 space-y-6">
//           <div className="grid md:grid-cols-2 gap-3">
//             <FormSelectInput
//               label="Student/Select"
//               options={studentOptions}
//               option={selectedStudent}
//               setOption={setSelectedStudent}
//             />

//             <div className="">
//               <Label className="mb-3 pb-3 " htmlFor="day-select">
//                 Select Day
//               </Label>
//               <Select value={selectedDay} onValueChange={setSelectedDay}>
//                 <SelectTrigger id="day-select">
//                   <SelectValue placeholder="Select a day" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white text-black">
//                   {weekDays.map((day) => (
//                     <SelectItem key={day.value} value={day.value}>
//                       {day.name} ({format(day.date, "MMM d")})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           {loading ? (
//             <Button disabled>
//               <Loader2 className="animate-spin" />
//               Fetching Please wait...
//             </Button>
//           ) : (
//             <Button onClick={getStudentList}>Get Student List</Button>
//           )}
//         </CardContent>
//       </Card>
//       {studentData && studentData.subjects.length > 0 ? (
//         <>
//           <Card className="p-6">
//             <div className="flex flex-col space-y-4">
//               <h3 className="text-2xl text-center font-semibold mb-2">
//                 Attendance for {selectedStudent?.label} - {selectedDayName}
//               </h3>

//               <StudentAttendanceTable data={studentData} />
//             </div>
//           </Card>
//         </>
//       ) : (
//         <div className="">
//           <h2>No data Found</h2>
//         </div>
//       )}
//     </div>
//   );
// }















"use client";

import useSchoolStore from "../../../../../../store/school";
import { UserRole } from "../../../../../../types/types";
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
import { Calendar, Loader2 } from "lucide-react";
import FormSelectInput from "../../../../../../components/FormInputs/FormSelectInput";
import { addDays, format, startOfWeek } from "date-fns";
import { Label } from "../../../../../../components/ui/label";
import { getStudentAttendanceList } from "../../../../../../actions/attendance";
import { StudentAttendanceData } from "../../../../../../types/studentAttendance";
import StudentAttendanceTable from "./StudentAttence";

type BriefStudent = {
  id: string;
  name: string;
  regNo: string;
};

const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

const weekDays = Array.from({ length: 7 }, (_, i) => {
  const day = addDays(startOfCurrentWeek, i);
  return {
    date: day,
    name: format(day, "EEEE"),
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

  const [studentData, setStudentData] =
    useState<StudentAttendanceData | null>(null);

  const [selectedDay, setSelectedDay] = useState<string>(weekDays[0].value);
  const selectedDayName =
    weekDays.find((day) => day.value === selectedDay)?.name || "Monday";

  const studentOptions = students.map((item) => ({
    label: `${item.name}-${item.regNo}`,
    value: item.id,
  }));

  const [selectedStudent, setSelectedStudent] = useState<any>(
    studentOptions[0]
  );

  const [loading, setLoading] = useState(false);

  async function getStudentList() {
    setLoading(true);
    try {
      const studentId = selectedStudent.value as string;
      const date =
        weekDays.find((day) => day.value === selectedDay)?.date ||
        new Date();

      const data = await getStudentAttendanceList(studentId, date);
      setStudentData(data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* FILTER CARD */}
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelectInput
              label="Student/Select"
              options={studentOptions}
              option={selectedStudent}
              setOption={setSelectedStudent}
            />

            <div>
              <Label className="mb-2 block text-sm" htmlFor="day-select">
                Select Day
              </Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger id="day-select" className="w-full">
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

          {/* BUTTON */}
          <div className="flex">
            {loading ? (
              <Button className="w-full sm:w-auto" disabled>
                <Loader2 className="animate-spin mr-2" />
                Fetching...
              </Button>
            ) : (
              <Button
                onClick={getStudentList}
                className="w-full sm:w-auto"
              >
                Get Student List
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RESULT */}
      {studentData && studentData.subjects.length > 0 ? (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg sm:text-2xl text-center font-semibold">
              Attendance for {selectedStudent?.label} - {selectedDayName}
            </h3>

            <StudentAttendanceTable data={studentData} />
          </div>
        </Card>
      ) : (
        <div className="flex justify-center items-center py-10 text-gray-500 text-sm sm:text-base">
          No data Found
        </div>
      )}
    </div>
  );
}