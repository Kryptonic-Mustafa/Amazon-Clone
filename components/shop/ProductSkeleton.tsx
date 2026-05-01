export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full w-full animate-pulse flex flex-col">
      <div className="h-64 w-full bg-slate-200" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-3 w-16 bg-slate-200 rounded mb-3" />
        <div className="h-4 w-full bg-slate-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-4" />
        
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="h-6 w-16 bg-slate-200 rounded" />
          </div>
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
