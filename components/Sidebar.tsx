"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/practice", label: "Practice" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <h1 className="mb-4 text-xl font-bold">Speak Polish AI</h1>
      <nav className="flex gap-2 md:flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
