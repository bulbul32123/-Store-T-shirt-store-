export default function ComingSoonPanel({ title, description, icon: Icon }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-[#E5E5E5] rounded-2xl">
            {Icon && <Icon size={32} strokeWidth={1.5} className="text-[#6F6F6F] mb-4" />}
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#111] mb-1">{title}</h3>
            <p className="text-sm text-[#6F6F6F] max-w-xs">{description}</p>
        </div>
    );
}