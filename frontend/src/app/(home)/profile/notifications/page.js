import NotificationsPanel from '@/components/profile/notifications/NotificationsPanel';

export const metadata = {
  title: "Notifications | Payra",
  description: "Orders, discounts, coupons, reviews, and Support chat notification.",
};


export default function NotificationsPage() {
    return (
        <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-1">Notifications</h2>
            <p className="text-sm text-[#6F6F6F] mb-8">New drops, discounts, coupons, and updates on your reviews.</p>
            <NotificationsPanel />
        </div>
    );
}