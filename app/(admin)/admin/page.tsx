"use client";

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { useAdminOverview } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, CHART_COLORS } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyCount } from "@/lib/api/admin.api";

const STAT_LABELS: Record<string, string> = {
  users: "Users",
  contributions: "Contributions",
  handouts: "Handouts",
  pastMcqs: "Past-Quiz MCQs",
  aiMcqs: "AI MCQs",
  feedback: "Feedback",
  newsletter: "Newsletter Subs",
};

function TrendChart({
  title,
  data,
  color,
}: {
  title: string;
  data: DailyCount[];
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-destructive">Failed to load dashboard stats.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(data.totals).map(([key, value]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{STAT_LABELS[key] ?? key}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart title="Signups (30d)" data={data.trends.signupsPerDay} color={CHART_COLORS[0]} />
        <TrendChart title="Uploads (30d)" data={data.trends.uploadsPerDay} color={CHART_COLORS[1]} />
        <TrendChart title="Feedback (30d)" data={data.trends.feedbackPerDay} color={CHART_COLORS[2]} />
      </div>

      {data.topMissedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Missed Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {data.topMissedTopics.map((t) => (
                <li key={t._id} className="flex justify-between">
                  <span>{t._id}</span>
                  <span className="text-muted-foreground">{t.missedCount} misses</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
