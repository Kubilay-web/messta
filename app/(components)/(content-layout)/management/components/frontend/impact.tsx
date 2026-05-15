"use client";

import { PublicStats } from "../../actions/analytics";
import { School, Users, UserRound } from "lucide-react";
import { useState, useEffect } from "react";

export default function StatisticsSection({ data }: { data: PublicStats }) {
  // These would be fetched from your API in a real implementation
  const [stats, setStats] = useState({
    schools: 0,
    students: 0,
    parents: 0,
  });

  // Simulating data fetch - replace with actual API call
  useEffect(() => {
    // Simulating API response
    // const data = {
    //   schools: 120,
    //   students: 25000,
    //   parents: 18500,
    // };

    // Animate counting up
    const duration = 2000; // 2 seconds animation
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setStats({
        schools: Math.floor(data.schools * progress),
        students: Math.floor(data.students * progress),
        parents: Math.floor(data.parents * progress),
      });
      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
    return () => clearInterval(counter);
  }, []);

  return (
    <section className="w-full py-12 md:py-24 bg-blue-50 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid grid-cols-6 lg:grid-cols-12 gap-4 pointer-events-none">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div key={`v-line-${i}`} className="h-full w-px bg-blue-100"></div>
          ))}
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div key={`h-line-${i}`} className="w-full h-px bg-blue-100"></div>
          ))}
      </div>

      <div className="container px-4 md:px-6 relative">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
              Our Impact in Numbers
            </h2>
            <p className="max-w-[700px] text-blue-700 md:text-xl/relaxed">
              Trusted by educational institutions worldwide to streamline school
              management
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {/* Schools Stat */}
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-200 bg-white p-8 text-center shadow-md transition-all hover:shadow-lg hover:translate-y-[-4px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <School className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-blue-900">
              {stats.schools.toLocaleString()}
            </h3>
            <p className="text-xl font-medium text-blue-800">Schools</p>
            <p className="text-sm text-blue-600">
              Institutions using our platform
            </p>
          </div>

          {/* Students Stat */}
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-200 bg-white p-8 text-center shadow-md transition-all hover:shadow-lg hover:translate-y-[-4px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-blue-900">
              {stats.students.toLocaleString()}
            </h3>
            <p className="text-xl font-medium text-blue-800">Students</p>
            <p className="text-sm text-blue-600">Learning through our system</p>
          </div>

          {/* Parents Stat */}
          <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-blue-200 bg-white p-8 text-center shadow-md transition-all hover:shadow-lg hover:translate-y-[-4px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <UserRound className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-4xl font-bold text-blue-900">
              {stats.parents.toLocaleString()}
            </h3>
            <p className="text-xl font-medium text-blue-800">Parents</p>
            <p className="text-sm text-blue-600">
              Engaged with their children's education
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
