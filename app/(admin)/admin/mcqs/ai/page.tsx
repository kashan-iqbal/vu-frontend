"use client";

import * as React from "react";
import { useAdminAiMcqs } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminAiMcq } from "@/lib/api/admin.api";

export default function AdminAiMcqsPage() {
  const [page, setPage] = React.useState(1);
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState("");
  const [topic, setTopic] = React.useState("");

  const { data, isLoading, isError } = useAdminAiMcqs({
    page,
    limit: 20,
    code: code || undefined,
    type: type || undefined,
    topic: topic || undefined,
  });

  const columns: Column<AdminAiMcq>[] = [
    { key: "code", header: "Course", render: (q) => q.code },
    { key: "type", header: "Type", render: (q) => q.type },
    { key: "topic_name", header: "Topic", render: (q) => q.topic_name },
    {
      key: "question",
      header: "Question",
      className: "max-w-md whitespace-normal",
      render: (q) => q.question,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">AI-Generated MCQs</h1>
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
            <Input
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setPage(1);
              }}
              placeholder="Topic..."
              className="max-w-40"
            />
          </>
        }
      />
    </div>
  );
}
