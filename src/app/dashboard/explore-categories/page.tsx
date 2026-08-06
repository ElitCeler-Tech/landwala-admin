"use client";

import Link from "next/link";
import {
    ShieldCheck,
    UserCog,
    FileText,
    Map,
    Store,
    ChevronRight,
} from "lucide-react";

const CATEGORY_LINKS = [
    {
        name: "Land Protection",
        description: "View and quote land protection requests",
        href: "/dashboard/explore-categories/land-protection",
        icon: ShieldCheck,
    },
    {
        name: "Assign - Land Protections",
        description: "Manage agent assignment activity",
        href: "/dashboard/assign-land-protections",
        icon: UserCog,
    },
    {
        name: "Land Registrations",
        description: "Review land registration requests",
        href: "/dashboard/explore-categories/land-registrations",
        icon: FileText,
    },
    {
        name: "Layout Enquiries",
        description: "View enquiries submitted on layouts",
        href: "/dashboard/explore-categories/layout-enquiries",
        icon: Map,
    },
    {
        name: "Buy/Sell Plots",
        description: "View buy/sell plot enquiries",
        href: "/dashboard/explore-categories/buy-sell-plots",
        icon: Store,
    },
];

export default function ExploreCategoriesPage() {
    return (
        <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-gray-900 mb-2">
                    Explore Categories
                </h1>
                <p className="text-gray-500 italic">
                    Jump to any category management section below
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORY_LINKS.map(({ name, description, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-[#1e2667]/30 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#1e2667]/10 flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6 text-[#1e2667]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{name}</h3>
                            <p className="text-sm text-gray-500">{description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
