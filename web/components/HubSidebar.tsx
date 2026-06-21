"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/hub/home" },
    ],
  },
  {
    section: "Blog",
    items: [
      { label: "Topic Queue", href: "/hub/blog/queue" },
      { label: "Settings",    href: "/hub/blog/settings" },
    ],
  },
  {
    section: "Accounts",
    items: [
      { label: "Users", href: "/hub/accounts" },
    ],
  },
  {
    section: "Promotions",
    items: [
      { label: "Vouchers",    href: "/hub/vouchers" },
      { label: "Businesses",  href: "/hub/businesses" },
    ],
  },
  {
    section: "Agent",
    items: [
      { label: "Response Cache",    href: "/hub/cache" },
      { label: "Approved Sources",  href: "/hub/sources" },
    ],
  },
];

export default function HubSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 min-h-full">
      <nav className="py-6">
        {NAV.map((group) => (
          <div key={group.section} className="mb-6">
            <p className="px-5 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {group.section}
            </p>
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[#0A2240]/5 text-[#0A2240] font-semibold border-r-2 border-[#0A2240]"
                      : "text-gray-500 hover:text-[#0A2240] hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
