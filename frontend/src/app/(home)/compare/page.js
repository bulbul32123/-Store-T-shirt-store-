import CompareTable from '@/components/products/CompareTable';

export default function ComparePage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#111] mb-8">Compare products</h1>
            <CompareTable />
        </div>
    );
}