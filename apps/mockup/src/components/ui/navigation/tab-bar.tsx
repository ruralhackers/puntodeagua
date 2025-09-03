"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function TabBar() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/",
      label: "Inicio",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/dashboard/registros",
      label: "Registros",
      icon: FileText,
      active: pathname.includes("/dashboard/registros")
    },
    {
      href: "/dashboard/mas",
      label: "Más",
      icon: Menu,
      active: pathname.includes("/dashboard/mas")
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-xs",
              tab.active ? "text-blue-600" : "text-gray-500"
            )}
          >
            {tab.icon && (
              <tab.icon
                className="h-6 w-6 mb-1 stroke-[1.5px]"
              />
            )}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}