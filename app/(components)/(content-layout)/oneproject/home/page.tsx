import ComparisonFeatures from "../components/ComparisonFeatures";
import Announcement from "../components/frontend/announcement";
import { Testimonials } from "../components/frontend/testimonials";
import { AnimatedAvatars } from "../components/global/avatar-circles";
import { CustomLinkButton } from "../components/global/CustomLinkButton";
import Iframe from "react-iframe";
import StarRating from "../components/global/StarRating";
import HowItWorks from "../components/HowItWorks";
import { BorderBeam } from "../components/magicui/border-beam";
import { ModeToggle } from "../components/mode-toggle";
import { Star } from "lucide-react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import SectionHeading from "../components/global/SectionHeading";
import Pricing from "../components/Pricing";
import { FAQ } from "../components/FAQ";
import { CustomerReviews } from "../components/frontend/CustomerReviews";
import Showcase from "../components/frontend/showcase";
import TabbedFeatures from "../components/tabbed-features";

export default async function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl py-8 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Portföyünüzü ve müşterilerinizi zahmetsizce yönetin
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-relaxed sm:leading-8 text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Sezgisel yönetim sistemimizle gayrimenkul iş akışınızın kontrolünü
              elinize alın. Müşterilerinizi kolayca kaydedin, ekibinizle gerçek
              zamanlı çalışın ve komisyon faturalandırmasını otomatikleştirin —
              her ilan ve işlemin profesyonel takibini elden bırakmadan.
            </p>
            <div className="flex justify-center">
              <CustomLinkButton title="Ücretsiz Deneyin" href="/register" />
            </div>
            
            <div className="pt-8 sm:pt-12 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="order-2 sm:order-1">
                <AnimatedAvatars />
              </div>
              <div className="order-1 sm:order-2 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start mb-2">
                  <StarRating count={5} />
                </div>
                <p className="text-sm sm:text-base dark:text-slate-900 text-gray-700">
                  500+ acente daha hızlı satış kapatıyor
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl py-8 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-12 sm:mb-16">
            <ComparisonFeatures />
          </div>
          
          <div className="mb-12 sm:mb-16">
            <TabbedFeatures />
          </div>
          
          {/* Dashboard Image Section */}
          <div className="py-8 sm:py-16 mb-12 sm:mb-16">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6">
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                <Image
                  src="/oneproject/dashboard.png"
                  alt="This is the dashboard Image"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
            </div>
          </div>
          
          {/* Customer Reviews Section */}
          <div className="py-8 sm:py-16 mb-12 sm:mb-16">
            <CustomerReviews />
          </div>
          
          {/* How It Works Section */}
          <div className="py-8 sm:py-16 mb-12 sm:mb-16">
            <HowItWorks />
          </div>
          
          {/* Testimonials Section */}
          <div className="py-8 sm:py-16 mb-12 sm:mb-16">
            <Testimonials />
          </div>
          
          {/* Video Section */}
          <div className="py-8 sm:py-16 mb-12 sm:mb-16">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <Iframe
                url="https://www.youtube.com/embed/Kxea70yK11I?si=ba72X9z64cEgaCp1"
                width="100%"
                height="100%"
                className="w-full h-full"
                display="block"
                position="relative"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="w-full bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/20">
        <div className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
          <Showcase />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="hidden sm:flex sm:justify-center mb-8 sm:mb-12">
            <Announcement
              title="Yeni: E-posta şablonları"
              href="/email-templates"
            />
          </div>
          
          <div className="text-center mb-12 sm:mb-16">
            <div className="max-w-4xl mx-auto">
              <SectionHeading title="Komisyon ve tahsilat takibinde saatler kaybetmeyin" />
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Faturalandırma derdini bırakın, müşteri yönetimini kolaylaştırın
                ve acentenize odaklanın. 1 dakikada, kod yazmadan kurulum.
              </p>
            </div>
          </div>
          
          <div className="py-8 sm:py-16">
            <Pricing />
            
            <div className="mt-12 sm:mt-16">
              <Testimonials />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/20 dark:to-transparent">
        <div className="mx-auto max-w-6xl py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="py-8 sm:py-16">
            <FAQ />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 sm:mb-6">
              Faturalandırma derdini bırakın, acentenize odaklanın
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Müşterileriniz faturalarını kendileri oluştursun, düzenlesin ve indirsin.
            </p>

            <div className="flex justify-center mb-8 sm:mb-12">
              <CustomLinkButton title="Başlayın" href="/courses/next/#pricing" />
            </div>
            
            <div className="pt-8 sm:pt-12 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <div className="order-2 sm:order-1">
                <AnimatedAvatars />
              </div>
              <div className="order-1 sm:order-2 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start mb-2">
                  <StarRating count={5} />
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  785 danışman daha rahat
                </p>
              </div>
            </div>
            
            <div className="pt-8 sm:pt-12">
              <Testimonials />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}