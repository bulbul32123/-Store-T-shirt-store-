import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
            <div className="animate-pulse">
                <Image
                    src="/Logo.svg"
                    alt="Loading..."
                    width={150}
                    height={150}
                    className="animate-bounce duration-1000"
                    priority
                />
            </div>
        </div>
    );
}