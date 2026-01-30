"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type Props = {
    data: { name: string; value: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-neutral-900/90 p-2 shadow-xl backdrop-blur-sm">
                <p className="mb-1 text-sm font-medium text-white">{label}</p>
                <p className="text-sm text-blue-400">
                    {payload[0].value} Municipalities
                </p>
            </div>
        )
    }
    return null
}

export function DXScoreChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar
                    dataKey="value"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    className="fill-blue-500"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
