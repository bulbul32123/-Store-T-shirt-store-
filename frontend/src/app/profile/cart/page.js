import LivingCartPanel from '@/components/profile/cart/LivingCartPanel';

export default function CartPage() {
    return (
        <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-1">Cart</h2>
            <p className="text-sm text-[#6F6F6F] mb-8">Everything you've picked out, waiting on you.</p>
            <LivingCartPanel />
        </div>
    );
}