import { getServerUser } from '../../../../actions/auth';
import SchoolOnboardingForm from '../../../../components/dashboard/forms/school/school-onboarding-form';
import { CardStackQuickUse } from '../../../../components/super-admin-dasboard/card-stack';

import { Card, CardContent } from '../../../../components/ui/card';
import { redirect } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import { validateRequest } from '@/app/auth';

export default async function page() {
  // const user = await getServerUser();
  // const role = user?.role;


  const {user}=await validateRequest();
  const role= user?.roleschool;


  // if (!user || role !== 'SUPER_ADMIN') {
  //   redirect('/login');
  // }


  return (
    <>
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <SchoolOnboardingForm />
        </CardContent>
      </Card>
    </>
  );
}
