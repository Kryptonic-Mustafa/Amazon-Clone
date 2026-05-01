import { ShieldCheck, Truck, CreditCard, HeadphonesIcon } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Truck size={32} className="text-yellow-500 mb-3" />,
      title: "Free Shipping",
      desc: "On all orders over $50"
    },
    {
      icon: <ShieldCheck size={32} className="text-yellow-500 mb-3" />,
      title: "Secure Payments",
      desc: "100% protected transactions"
    },
    {
      icon: <CreditCard size={32} className="text-yellow-500 mb-3" />,
      title: "Easy Returns",
      desc: "30-day return policy"
    },
    {
      icon: <HeadphonesIcon size={32} className="text-yellow-500 mb-3" />,
      title: "24/7 Support",
      desc: "Dedicated customer service"
    }
  ];

  return (
    <section className="bg-white py-10 border-y border-gray-200 shadow-sm mt-8 mb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
          {badges.map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center px-4">
              {badge.icon}
              <h3 className="font-bold text-gray-900 mb-1">{badge.title}</h3>
              <p className="text-sm text-gray-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
