import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, CheckCircle2, TrendingUp } from "lucide-react"

const stats = [
    {
        title: "Total Municipalities",
        value: "1,741",
        description: "Across 47 Prefectures",
        icon: Building2,
        color: "text-blue-500",
    },
    {
        title: "Proposals Generated",
        value: "128",
        description: "+14% from last month",
        icon: FileText,
        color: "text-purple-500",
    },
    {
        title: "Avg. Similarity",
        value: "0.78",
        description: "High confidence matches",
        icon: CheckCircle2,
        color: "text-green-500",
    },
    {
        title: "DX Score Avg",
        value: "54.2",
        description: "+2.1 points YoY",
        icon: TrendingUp,
        color: "text-orange-500",
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight glow-text text-white">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of Japan's Local Government DX Status.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
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
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-neutral-400">
                            No recent activity found.
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass border-white/10 col-span-3 bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">API Status</span>
                                <span className="text-green-400 flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">ML Model</span>
                                <span className="text-blue-400">GLuCoSE-base-ja</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
