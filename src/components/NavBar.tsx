"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/staff/login", label: "Staff", shortLabel: "Staff", match: "/staff" },
  { href: "/coordinator/login", label: "Coordinator", shortLabel: "Coord.", match: "/coordinator" },
  { href: "/donor/start", label: "Donor Board", shortLabel: "Donors", match: "/don" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">HopeLink</span>
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors",
                  pathname.startsWith(link.match)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <span className="sm:hidden">{link.shortLabel}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
