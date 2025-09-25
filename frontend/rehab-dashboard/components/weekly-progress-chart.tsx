"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { format, startOfWeek } from "date-fns"

interface WeeklyProgressChartProps {
  sessions: Array<{ start_time?: string; total_reps?: number; avg_score?: number; exercise_type?: string }>
}

export function WeeklyProgressChart({ sessions }: WeeklyProgressChartProps) {
  const data = useMemo(() => {
    const byWeek = new Map<string, { week: string; sessions: number; reps: number; avg: number; count: number }>()
    for (const s of sessions || []) {
      const d = s.start_time ? new Date(s.start_time) : null
      if (!d || isNaN(d.getTime())) continue
      const wk = startOfWeek(d, { weekStartsOn: 1 })
      const key = format(wk, "yyyy-MM-dd")
      const entry = byWeek.get(key) || { week: key, sessions: 0, reps: 0, avg: 0, count: 0 }
      entry.sessions += 1
      entry.reps += typeof s.total_reps === 'number' ? s.total_reps : 0
      entry.avg += typeof s.avg_score === 'number' ? s.avg_score : 0
      entry.count += 1
      byWeek.set(key, entry)
    }
    const arr = Array.from(byWeek.values()).sort((a,b)=> a.week.localeCompare(b.week))
    return arr.map(e => ({
      name: format(new Date(e.week), "MMM d"),
      sessions: e.sessions,
      reps: e.reps,
      avgScore: e.count ? Math.round((e.avg / e.count)) : 0,
    }))
  }, [sessions])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip />
          <Bar dataKey="sessions" name="Sessions" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
