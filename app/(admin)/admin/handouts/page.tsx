"use client";

import * as React from "react";
import { useAdminHandouts } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Select } from "@/components/ui/select";
import type { AdminHandout } from "@/lib/api/admin.api";

export default function AdminHandoutsPage() {
  const [page, setPage] = React.useState(1);
  const [examType, setExamType] = React.useState("");

  const { data, isLoading, isError } = useAdminHandouts({
    page,
    limit: 20,
    examType: examType || undefined,
  });

  const columns: Column<AdminHandout>[] = [
    { key: "code", header: "Course", render: (h) => h.code },
    { key: "examType", header: "Exam Type", render: (h) => h.examType },
    {
      key: "contentLength",
      header: "Length (chars)",
      render: (h) => h.contentLength.toLocaleString(),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (h) => new Date(h.updatedAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Handouts</h1>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(h) => h._id}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
        filters={
          <Select
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
              setPage(1);
            }}
            className="w-40"
          >
            <option value="">All exam types</option>
            <option value="midterm">Midterm</option>
            <option value="finalterm">Finalterm</option>
          </Select>
        }
      />
    </div>
  );
}
