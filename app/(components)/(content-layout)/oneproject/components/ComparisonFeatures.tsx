import React from "react";
import SectionHeading from "./global/SectionHeading";
import FeaturesCard from "./FeaturesCard";

export default function ComparisonFeatures() {
  const pros = [
    "Merkezi portföy bilgisi ve iletişim",
    "Gerçek zamanlı ekip iş birliği ve güncellemeler",
    "Otomatik komisyon faturalandırma ve tahsilat takibi",
    "Düzenli dosya yönetim sistemi",
    "Profesyonel portföy/vitrin oluşturma",
    "Zaman kazandıran ilan şablonları",
    "Gelişmiş müşteri ilişkileri yönetimi",
    "Artan ekip verimliliği",
    "Daha iyi satış süreci görünürlüğü ve kontrolü",
    "Güvenli veri saklama ve yedekleme",
  ];

  const cons = [
    "E-postalar ve belgeler arasında dağınık bilgi",
    "Zaman alan manuel fatura oluşturma",
    "Satış sürecini takip etmede zorluk",
    "Tutarsız müşteri iletişimi",
    "Dosyaların kaybolma riski",
    "Merkezi müşteri geçmişinin olmaması",
    "Sınırlı iş birliği imkânı",
    "Tekrarlayan işlerde kaybedilen zaman",
    "Profesyonel portföy vitrininin olmaması",
    "Yerel dosya saklamada güvenlik riskleri",
  ];
  return (
    <div className="text-center ">
      <div className="pb-6">
        <SectionHeading title="Portföy ve müşterileri elle yönetmekten yoruldunuz mu?" />
      </div>
      <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeaturesCard
          features={cons}
          title="Emlak Pro olmadan yönetim"
          className="bg-red-50 text-red-800"
        />
        <FeaturesCard
          features={pros}
          title="Emlak Pro ile yönetim"
          className="bg-green-50 text-green-800"
        />
      </div>
    </div>
  );
}
