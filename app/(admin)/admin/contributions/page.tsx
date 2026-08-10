"use client";

import * as React from "react";
import {
  useAdminContributions,
  useApproveContribution,
  useRejectContribution,
  useAdminContributors,
  useAdminContributorDetail,
} from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdminContribution, AdminContributor } from "@/lib/api/admin.api";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Contributions created before the moderation feature shipped have no
// `status` field at all (it only defaults for newly-created docs) — treat
// that as pending everywhere the frontend reads status, same as the backend
// aggregation does.
function normalizeStatus(status: string | undefined | null) {
  return status ?? "pending";
}

function statusVariant(status: string | undefined | null) {
  const s = normalizeStatus(status);
  if (s === "approved") return "default" as const;
  if (s === "rejected") return "destructive" as const;
  return "secondary" as const;
}

function UploadsTab() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useAdminContributions({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
  });
  const approve = useApproveContribution();
  const reject = useRejectContribution();

  const columns: Column<AdminContribution>[] = [
    { key: "code", header: "Course", render: (c) => c.code },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge variant={statusVariant(c.status)}>{normalizeStatus(c.status)}</Badge>,
    },
    { key: "uploaderName", header: "Uploader", render: (c) => c.uploaderName },
    { key: "uploaderPhone", header: "Phone", render: (c) => c.uploaderPhone },
    { key: "originalName", header: "File", render: (c) => c.originalName },
    { key: "size", header: "Size", render: (c) => formatSize(c.size) },
    {
      key: "createdAt",
      header: "Uploaded",
      render: (c) => new Date(c.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          {c.pdfUrl && (
            <Button variant="outline" size="sm" onClick={() => setPreviewUrl(c.pdfUrl)}>
              View
            </Button>
          )}
          {normalizeStatus(c.status) === "pending" && (
            <>
              <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(c._id)}>
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={reject.isPending}
                onClick={() => reject.mutate(c._id)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(c) => c._id}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search course code or uploader..."
        filters={
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-36"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        }
      />

      {/* Same-tab preview: an in-page dialog, never a new browser tab. */}
      <Dialog open={Boolean(previewUrl)} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="flex h-[85vh] max-w-[calc(100%-2rem)] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="min-h-0 w-full flex-1 rounded-md border"
              title="Contribution PDF preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ContributorsTab() {
  const [page, setPage] = React.useState(1);
  const [activePhone, setActivePhone] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useAdminContributors({ page, limit: 20 });
  const { data: detail, isLoading: isDetailLoading } = useAdminContributorDetail(activePhone);

  const columns: Column<AdminContributor>[] = [
    { key: "name", header: "Name", render: (c) => c.name },
    { key: "phone", header: "Phone", render: (c) => c.phone },
    { key: "total", header: "Total Uploads", render: (c) => c.total },
    { key: "approved", header: "Approved", render: (c) => c.approved },
    { key: "rejected", header: "Rejected", render: (c) => c.rejected },
    { key: "pending", header: "Pending", render: (c) => c.pending },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <Button variant="outline" size="sm" onClick={() => setActivePhone(c.phone)}>
          View details
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(c) => c.phone}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        page={page}
        onPageChange={setPage}
      />

      <Dialog open={Boolean(activePhone)} onOpenChange={(open) => !open && setActivePhone(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.name ?? activePhone}</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : detail ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 text-sm">
                <span>Total: {detail.summary.total}</span>
                <span className="text-emerald-600">Approved: {detail.summary.approved}</span>
                <span className="text-destructive">Rejected: {detail.summary.rejected}</span>
                <span className="text-muted-foreground">Pending: {detail.summary.pending}</span>
              </div>
              <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto text-sm">
                {detail.uploads.map((u) => (
                  <li key={u._id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="font-medium">{u.code}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(u.status)}>{normalizeStatus(u.status)}</Badge>
                      {u.pdfUrl && (
                        <Button variant="outline" size="sm" onClick={() => setPreviewUrl(u.pdfUrl)}>
                          View
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Same-tab preview: an in-page dialog, never a new browser tab. */}
      <Dialog open={Boolean(previewUrl)} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="flex h-[85vh] max-w-[calc(100%-2rem)] flex-col sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="min-h-0 w-full flex-1 rounded-md border"
              title="Contribution PDF preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminContributionsPage() {
  const [tab, setTab] = React.useState<"uploads" | "contributors">("uploads");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Contributions</h1>

      <div className="flex gap-2 border-b">
        {(["uploads", "contributors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "uploads" ? <UploadsTab /> : <ContributorsTab />}
    </div>
  );
}
