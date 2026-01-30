"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, CheckCircle2, TrendingUp } from "lucide-react"
import { DXScoreChart } from "@/components/dashboard/DXScoreChart"
import { RankingChart } from "@/components/dashboard/RankingChart"

type DashboardStats = {
    total: number
    avgScore: number
    distribution: { name: string; value: number }[]
    topRanking: { name: string; score: number }[]
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: "Total Municipalities",
            value: stats?.total.toLocaleString() || "...",
            description: "Across 47 Prefectures",
            icon: Building2,
            color: "text-blue-500",
        },
        {
            title: "Avg. DX Score",
            value: stats?.avgScore || "...",
            description: "National Average",
            icon: TrendingUp,
            color: "text-orange-500",
        },
        {
            title: "Proposals Generated",
            value: "128",
            description: "+14% from last month",
            icon: FileText,
            color: "text-purple-500",
        },
        {
            title: "System Status",
            value: "Operational",
            description: "All systems normal",
            icon: CheckCircle2,
            color: "text-green-500",
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight glow-text text-white">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of Japan's Local Government DX Status.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="glass border-white/10 bg-white/5 transition-all hover:bg-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-muted-foreground text-white/50">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="glass border-white/10 col-span-4 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">DX Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {stats ? (
                            <DXScoreChart data={stats.distribution} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                Loading...
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass border-white/10 col-span-3 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Top 5 Municipalities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats ? (
                            <RankingChart data={stats.topRanking} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                Loading...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
