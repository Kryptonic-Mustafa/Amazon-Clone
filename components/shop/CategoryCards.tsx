import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  {
    title: 'Gaming accessories',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    link: '/shop?q=gaming',
    linkText: 'See more'
  },
  {
    title: 'Deals in Laptops',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    link: '/shop?q=laptop',
    linkText: 'Shop now'
  },
  {
    title: 'Refresh your space',
    image: 'https://images.unsplash.com/photo-1583847268964-b28ce8f52859?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    link: '/shop?q=home',
    linkText: 'Explore home'
  },
  {
    title: 'Fashion Top Trends',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    link: '/shop?q=shirt',
    linkText: 'Shop clothing'
  }
];

export default function CategoryCards() {
  return (
    <div className="container mx-auto px-4 relative z-20 -mt-16 lg:-mt-32 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="bg-white p-6 pb-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col h-[380px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{cat.title}</h2>
            <div className="relative flex-grow mb-4 bg-gray-50 overflow-hidden group">
              <Link href={cat.link}>
                <Image 
                  src={cat.image} 
                  alt={cat.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
            </div>
            <Link href={cat.link} className="text-blue-600 hover:text-red-500 text-sm font-semibold hover:underline">
              {cat.linkText}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
