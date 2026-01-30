"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    Map,
    Settings,
    Building2,
    Menu,
} from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Municipalities",
        href: "/dashboard/municipalities",
        icon: Building2,
    },
    {
        title: "Proposals",
        href: "/dashboard/proposals",
        icon: FileText,
    },
    {
        title: "DX Map 3D",
        href: "/dashboard/map",
        icon: Map,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div
            className={cn(
                "glass-deep flex h-screen w-64 flex-col justify-between border-r border-white/5 pb-4 pt-6 text-white transition-all duration-300 md:w-64",
                className
            )}
        >
            <div className="px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        LocalGov DX
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-8">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-white/10 text-white shadow-lg shadow-black/5 ring-1 ring-white/10 backdrop-blur-md"
                                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-indigo-400"
                                )}
                            />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            <div className="px-4">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 p-[2px]">
                            <div className="h-full w-full rounded-full bg-neutral-900" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Admin User</span>
                            <span className="text-xs text-neutral-500">Log out</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
