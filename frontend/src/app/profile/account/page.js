import AccountForm from '@/components/profile/AccountForm';

export default function AccountPage() {
    return (
        <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#111] mb-1">Profile</h2>
            <p className="text-sm text-[#6F6F6F] mb-8">Manage your personal details and login information.</p>
            <AccountForm />
        </div>
    );
}