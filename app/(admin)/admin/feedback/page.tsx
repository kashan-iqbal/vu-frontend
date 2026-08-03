"use client";

import * as React from "react";
import { useAdminFeedback } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AdminFeedback } from "@/lib/api/admin.api";

export default function AdminFeedbackPage() {
  const [page, setPage] = React.useState(1);
  const [rating, setRating] = React.useState("");

  const { data, isLoading, isError } = useAdminFeedback({
    page,
    limit: 20,
    rating: rating || undefined,
  });

  const columns: Column<AdminFeedback>[] = [
    { key: "rating", header: "Rating", render: (f) => <Badge>{f.rating} / 5</Badge> },
    {
      key: "comment",
      header: "Comment",
      className: "max-w-md whitespace-normal",
      render: (f) => f.comment ?? "—",
    },
    { key: "context", header: "Context", render: (f) => f.context ?? "—" },
    { key: "user", header: "User", render: (f) => f.user?.email ?? "Anonymous" },
    {
      key: "createdAt",
      header: "Date",
      render: (f) => new Date(f.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Feedback</h1>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(f) => f._id}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
        filters={
          <Select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="w-32"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} star{r !== 1 ? "s" : ""}
              </option>
            ))}
          </Select>
        }
      />
    </div>
  );
}
