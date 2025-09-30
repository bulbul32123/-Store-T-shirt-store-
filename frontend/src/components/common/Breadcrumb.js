import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumb({ items }) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                            <FiChevronRight className="mx-1 text-gray-400" />
                        )}

                        {index === items.length - 1 ? (
                            <span className="text-gray-500">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
} 