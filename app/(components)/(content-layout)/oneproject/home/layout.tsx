import Footer from "../components/frontend/site-footer";
import React, { ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header (paylaşılan) üst layout'tan gelir. */}

      {/* Main Content - Esnek alan */}
      <main className="flex-1 w-full overflow-hidden">
        {/* Responsive Container */}
        <div className="w-full h-full flex flex-col">
          {/* Background Effects Container */}
          <div className="relative w-full h-full">
            {/* Top Blur Effect - Responsive positioning with flex */}
            <div className="w-full h-0 relative">
              <div className="flex justify-center items-start w-full">
                <div 
                  className="w-[80vw] max-w-[1200px] h-[400px] sm:h-[500px] md:h-[600px]
                    bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-15
                    rounded-[50%] blur-3xl transform rotate-[30deg]
                    -translate-y-1/2 mt-[-200px] sm:mt-[-250px] md:mt-[-300px]"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="relative w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>

            {/* Bottom Blur Effect - Responsive positioning with flex */}
            <div className="w-full h-0 relative">
              <div className="flex justify-center items-end w-full">
                <div 
                  className="w-[70vw] max-w-[1100px] h-[350px] sm:h-[450px] md:h-[550px]
                    bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-15
                    rounded-[50%] blur-3xl
                    translate-y-1/2 mb-[-175px] sm:mb-[-225px] md:mb-[-275px]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Her zaman altta */}
      <footer className="w-full shrink-0 mt-12 sm:mt-16 md:mt-20">
        <Footer />
      </footer>
    </div>
  );
}