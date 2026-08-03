"use client";

import * as React from "react";
import { useAdminPastMcqs } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminPastMcq } from "@/lib/api/admin.api";

export default function AdminPastMcqsPage() {
  const [page, setPage] = React.useState(1);
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState("");

  const { data, isLoading, isError } = useAdminPastMcqs({
    page,
    limit: 20,
    code: code || undefined,
    type: type || undefined,
  });

  const columns: Column<AdminPastMcq>[] = [
    { key: "code", header: "Course", render: (q) => q.code },
    { key: "type", header: "Type", render: (q) => q.type },
    {
      key: "question",
      header: "Question",
      className: "max-w-md whitespace-normal",
      render: (q) => q.question,
    },
    { key: "options", header: "# Options", render: (q) => q.options.length },
    { key: "generated", header: "Generated", render: (q) => (q.generated ? "Yes" : "No") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Past-Quiz MCQs</h1>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(q) => q._id}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
        filters={
          <>
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setPage(1);
              }}
              placeholder="Course code..."
              className="max-w-40"
            />
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-40"
            >
              <option value="">All types</option>
              <option value="midterm">Midterm</option>
              <option value="finalterm">Finalterm</option>
            </Select>
          </>
        }
      />
    </div>
  );
}
