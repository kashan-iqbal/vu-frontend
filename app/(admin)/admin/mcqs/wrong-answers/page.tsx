"use client";

import * as React from "react";
import { useAdminWrongAnswers } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminWrongAnswer } from "@/lib/api/admin.api";

export default function AdminWrongAnswersPage() {
  const [page, setPage] = React.useState(1);
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState("");

  const { data, isLoading, isError } = useAdminWrongAnswers({
    page,
    limit: 20,
    code: code || undefined,
    type: type || undefined,
  });

  const columns: Column<AdminWrongAnswer>[] = [
    { key: "code", header: "Course", render: (w) => w.code },
    { key: "type", header: "Type", render: (w) => w.type },
    { key: "topic_name", header: "Topic", render: (w) => w.topic_name },
    { key: "quizId", header: "Quiz ID", render: (w) => w.quizId },
    { key: "userId", header: "User ID", render: (w) => w.userId },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Wrong Answers</h1>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(w) => w._id}
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
