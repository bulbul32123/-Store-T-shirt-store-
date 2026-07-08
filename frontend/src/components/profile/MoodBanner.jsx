export default function MoodBanner({ headline, message, urgent = false }) {
    return (
        <div
            className={`rounded-2xl px-6 py-5 mb-8 border ${
                urgent ? 'border-[#FF5A1F] bg-[#FF5A1F]/5' : 'border-[#E5E5E5] bg-[#F5F5F5]'
            }`}
        >
            <p className={`text-sm font-bold uppercase tracking-tight mb-1 ${urgent ? 'text-[#FF5A1F]' : 'text-[#111]'}`}>
                {headline}
            </p>
            <p className="text-sm text-[#6F6F6F]">{message}</p>
        </div>
    );
}