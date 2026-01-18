import Image from 'next/image';
import Link from 'next/link';

// 1. Define the Types of blocks available
export type BlockType = 'hero' | 'text' | 'image' | 'features';

export interface Block {
  id: string; // Unique ID for Drag & Drop
  type: BlockType;
  content: any;
}

// 2. The Renderer Component
export default function BlockRenderer({ block }: { block: Block }) {
  const { type, content } = block;

  switch (type) {
    case 'hero':
      return (
        <section className="relative bg-slate-900 text-white py-24 px-6 text-center">
          {content.bgImage && (
            <div className="absolute inset-0 opacity-30">
              <Image src={content.bgImage} alt="bg" fill className="object-cover" />
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title || "Hero Title"}</h1>
            <p className="text-lg text-slate-200 mb-8">{content.subtitle || "Hero Subtitle"}</p>
            {content.btnText && (
              <Link href={content.btnLink || '#'} className="bg-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-700">
                {content.btnText}
              </Link>
            )}
          </div>
        </section>
      );

    case 'text':
      return (
        <section className="py-12 px-6 container mx-auto prose lg:prose-xl text-center">
          <div dangerouslySetInnerHTML={{ __html: content.html || "<p>Add your text here...</p>" }} />
        </section>
      );

    case 'image':
      return (
        <section className="py-12 px-6 container mx-auto">
          <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
            <Image src={content.url || '/placeholder.png'} alt="img" fill className="object-cover" />
          </div>
        </section>
      );

    case 'features':
      return (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            {(content.items || []).map((item: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <h3 className="font-bold text-lg mb-2">{item.title || "Feature"}</h3>
                <p className="text-sm text-slate-600">{item.desc || "Description goes here."}</p>
              </div>
            ))}
          </div>
        </section>
      );

    default:
      return <div className="p-4 border border-red-500">Unknown Block Type: {type}</div>;
  }
}