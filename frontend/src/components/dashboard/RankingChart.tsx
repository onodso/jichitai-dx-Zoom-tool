"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type Props = {
    data: { name: string; score: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-neutral-900/90 p-2 shadow-xl backdrop-blur-sm">
                <p className="mb-1 text-sm font-medium text-white">{label}</p>
                <p className="text-sm text-green-400">
                    Score: {payload[0].value}
                </p>
            </div>
        )
    }
    return null
}

export function RankingChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar
                    dataKey="score"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    className="fill-green-500"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
