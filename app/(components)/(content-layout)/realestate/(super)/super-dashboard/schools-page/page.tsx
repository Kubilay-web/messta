import { deleteSchoolById, getAllSchoolsAction } from '../../../actions/schools';
import SchoolTable from '../../../components/super-admin-dasboard/school-table';
import React from 'react';

export default async function page() {
  const schools = await getAllSchoolsAction();
  return (
    <>
      <SchoolTable title="Schools In The System" schools={schools} />
    </>
  );
}
