import { validateRequest } from "@/app/auth";
import { getServerUser, SchoolUser } from "../../../actions/auth";
import { getParentIdFromUserId, getStudentsByParentId } from "../../../actions/parents";
import { getProfileId } from "../../../actions/users";
import { StudentList } from "../../../components/portal/parents/StudentList";
import React from "react";

export default async function page() {

  

  
  // if (!user) {
  //   return;
  // }


  // get parent profile


    const { user } = await validateRequest();
  
    if (!user) return null;
  
    const school = await SchoolUser(user.id);
  
    console.log("========== PARENT PAYMENTS ==========");
    console.log("👤 User ID:", user.id);
    console.log("👤 User email:", user.email);
    console.log("👤 User role:", user.roleschool);
  
    const parentId = await getParentIdFromUserId(user.id);
  

    const students = await getStudentsByParentId(parentId);

  
  return (
    <div className="p-8">
      {students.length > 0 ? (
        <StudentList students={students} />
      ) : (
        <div>
          <h3>You dont have any Children-{user?.id}</h3>
        </div>
      )}
    </div>
  );
}
