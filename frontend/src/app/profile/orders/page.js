import ComingSoonPanel from '@/components/profile/ComingSoonPanel';
import { Package } from 'lucide-react';

export default function OrdersPage() {
    return (
        <ComingSoonPanel
            icon={Package}
            title="Orders"
            description="Your order history and tracking will show up here once you check out."
        />
    );
}
