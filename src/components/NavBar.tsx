"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/staff/login",
    label: "Organization",
    shortLabel: "Org.",
    match: "/staff",
    hoverClass:
      "hover:text-[rgb(37,99,235)] hover:bg-[rgba(37,99,235,0.10)]",
    activeClass: "text-[rgb(37,99,235)] bg-[rgba(37,99,235,0.14)]",
  },
  {
    href: "/coordinator/login",
    label: "Coordinator",
    shortLabel: "Coord.",
    match: "/coordinator",
    hoverClass:
      "hover:text-[rgb(5,150,105)] hover:bg-[rgba(5,150,105,0.10)]",
    activeClass: "text-[rgb(5,150,105)] bg-[rgba(5,150,105,0.14)]",
  },
  {
    href: "/donor/start",
    label: "Donor Board",
    shortLabel: "Donors",
    match: "/donor",
    hoverClass:
      "hover:text-[rgb(147,51,234)] hover:bg-[rgba(147,51,234,0.10)]",
    activeClass: "text-[rgb(147,51,234)] bg-[rgba(147,51,234,0.14)]",
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="w-full pl-0 pr-4 sm:pr-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="HopeLink logo"
            width={160}
            height={80}
            className="h-17 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.match);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? link.activeClass
                    : `text-gray-600 ${link.hoverClass}`
                }`}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
