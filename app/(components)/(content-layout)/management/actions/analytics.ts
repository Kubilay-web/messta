// "use server";

// export type Analytics = {
//   title: string;
//   count: number;
// };

// export interface PublicStats {
//   students: number;
//   teachers: number;
//   schools: number;
//   parents: number;
// }

// export interface AdminStats {
//   students: number;
//   teachers: number;
//   parents: number;
//   totalPending: number;
//   totalPaid: number;
//   recentStudents: Student[];
//   recentEvents: Event[];
// }

// interface Student {
//   id: string;
//   name: string;
//   regNo: string;
//   gender: "MALE" | "FEMALE";
//   class: {
//     title: string;
//   };
// }

// interface Event {
//   id: string;
//   title: string;
//   startTime: string;
//   endTime: string;
//   date: string;
//   location: string;
// }

// export type TeacherAnalyticsData = {
//   students: number;
//   exams: number;
//   reminders: number;
//   recentStudents: Student[];
//   recentEvents: Event[];
// };



// export async function getAllAnalytics(schoolId: string): Promise<AdminStats> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/${schoolId}`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch analytics");

//     const analytics = await res.json();
//     return analytics as AdminStats;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       teachers: 0,
//       parents: 0,
//       totalPending: 0,
//       totalPaid: 0,
//       recentStudents: [],
//       recentEvents: [],
//     };
//   }
// }

// export async function getTeacherAnalytics(
//   schoolId: string
// ): Promise<TeacherAnalyticsData> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/teachers/${schoolId}`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch teacher analytics");

//     const analytics = await res.json();
//     return analytics as TeacherAnalyticsData;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       reminders: 0,
//       exams: 0,
//       recentStudents: [],
//       recentEvents: [],
//     };
//   }
// }

// export async function getPublicStats(): Promise<PublicStats> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolproject/analytics/public`, {
//       method: "GET",
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error("Failed to fetch public stats");

//     const analytics = await res.json();
//     return analytics as PublicStats;
//   } catch (error) {
//     console.log(error);
//     return {
//       students: 0,
//       teachers: 0,
//       schools: 0,
//       parents: 0,
//     };
//   }
// }









"use server";

export type Analytics = {
  title: string;
  count: number;
};

export interface PublicStats {
  students: number;
  teachers: number;
  schools: number;
  parents: number;
}

export interface AdminStats {
  students: number;
  teachers: number;
  parents: number;
  totalPending: number;
  totalPaid: number;
  recentStudents: Student[];
  recentEvents: Event[];
}

interface Student {
  id: string;
  name: string;
  regNo: string;
  gender: "MALE" | "FEMALE";
  class: {
    title: string;
  };
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
}

export type TeacherAnalyticsData = {
  students: number;
  exams: number;
  reminders: number;
  recentStudents: Student[];
  recentEvents: Event[];
};

// Fetch admin analytics for a specific school
export async function getAllAnalytics(schoolId: string): Promise<AdminStats> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=school&schoolId=${schoolId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch analytics");

    const analytics = await res.json();
    return analytics as AdminStats;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      teachers: 0,
      parents: 0,
      totalPending: 0,
      totalPaid: 0,
      recentStudents: [],
      recentEvents: [],
    };
  }
}

// Fetch teacher-specific analytics for a school
export async function getTeacherAnalytics(
  schoolId: string,
): Promise<TeacherAnalyticsData> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=teacher&schoolId=${schoolId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch teacher analytics");

    const analytics = await res.json();
    return analytics as TeacherAnalyticsData;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      reminders: 0,
      exams: 0,
      recentStudents: [],
      recentEvents: [],
    };
  }
}

// Fetch public stats (no schoolId required)
export async function getPublicStats(): Promise<PublicStats> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/schoolmanage/analytics?type=public`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch public stats");

    const analytics = await res.json();
    return analytics as PublicStats;
  } catch (error) {
    console.log(error);
    return {
      students: 0,
      teachers: 0,
      schools: 0,
      parents: 0,
    };
  }
}