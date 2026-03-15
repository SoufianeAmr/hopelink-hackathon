"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, BarChart3, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <div className="max-w-2xl mx-auto mt-6 sm:mt-10">
        <div className="text-center mb-3">
          <div className="logo-reveal flex justify-center mb-1">
            <Image
              src="/logo.png"
              alt="HopeLink logo"
              width={300}
              height={120}
              className="h-36 sm:h-28 w-auto object-contain"
              priority
            />
          </div>

          <p className="subtitle-reveal text-gray-500">
            See needs. Match resources. Reduce waste.
          </p>
          <p className="subtitle-reveal-2 text-sm mt-1 text-[rgb(147,51,234)]">
            Real-time coordination for the GMHSC network
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/staff/login"
            className="flex items-center gap-4 bg-white border rounded-xl p-5 transition-all group hover:border-[rgb(37,99,235)] hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(37,99,235,0.10)] transition-colors group-hover:bg-[rgba(37,99,235,0.18)]">
              <Building2 className="w-6 h-6 text-[rgb(37,99,235)]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Organization</h2>
              <p className="text-sm text-gray-500">
                Post available items or needs. See matches with other organizations.
              </p>
            </div>
          </Link>

          <Link
            href="/coordinator/login"
            className="flex items-center gap-4 bg-white border rounded-xl p-5 transition-all group hover:border-[rgb(5,150,105)] hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(5,150,105,0.10)] transition-colors group-hover:bg-[rgba(5,150,105,0.18)]">
              <BarChart3 className="w-6 h-6 text-[rgb(5,150,105)]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Coordinator</h2>
              <p className="text-sm text-gray-500">
                Monitor network activity, view matches, and track coordination across organizations.
              </p>
            </div>
          </Link>

          <Link
            href="/donor/start"
            className="flex items-center gap-4 bg-white border rounded-xl p-5 transition-all group hover:border-[rgb(168,85,247)] hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.10)] transition-colors group-hover:bg-[rgba(168,85,247,0.18)]">
              <Heart className="w-6 h-6 text-[rgb(168,85,247)]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Donor</h2>
              <p className="text-sm text-gray-500">
                See what the network needs right now and offer to help. No account required.
              </p>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          HopeLink tracks donated items, not people. No personal data about individuals
          experiencing homelessness is collected.
        </p>
      </div>

      <style jsx>{`
        .logo-reveal {
          opacity: 0;
          transform: translateY(14px) scale(0.98);
          animation: fadeUpSoft 1s ease-out forwards;
        }

        .subtitle-reveal {
          opacity: 0;
          transform: translateY(8px);
          animation: fadeUp 0.8s ease-out 0.5s forwards;
        }

        .subtitle-reveal-2 {
          opacity: 0;
          transform: translateY(8px);
          animation: fadeUp 0.8s ease-out 0.65s forwards;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUpSoft {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
