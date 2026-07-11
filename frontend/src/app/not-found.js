import Link from "next/link";

// frontend/src/app/not-found.js
export const metadata = {
  title: "404 Page not found.",
  description:
    "Page not found",
};

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-600">This page could not be found.</p>
        <Link href='/'>Go back to Home</Link>
      </div>
    </div>
  );
}