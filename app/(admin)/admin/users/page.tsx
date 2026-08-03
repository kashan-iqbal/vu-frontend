"use client";

import * as React from "react";
import { useAdminUsers, useSetUserActiveStatus } from "@/hooks/use-admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { AdminUser } from "@/lib/api/admin.api";

export default function AdminUsersPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("");
  const [isActive, setIsActive] = React.useState("");

  const { data, isLoading, isError } = useAdminUsers({
    page,
    limit: 20,
    search: search || undefined,
    role: role || undefined,
    isActive: isActive || undefined,
  });
  const toggleStatus = useSetUserActiveStatus();

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (u) => u.name },
    { key: "email", header: "Email", render: (u) => u.email },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
      ),
    },
    { key: "provider", header: "Provider", render: (u) => u.provider },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.isActive ? "default" : "destructive"}>
          {u.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <Button
          variant="outline"
          size="sm"
          disabled={toggleStatus.isPending}
          onClick={() => toggleStatus.mutate({ id: u._id, isActive: !u.isActive })}
        >
          {u.isActive ? "Disable" : "Enable"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u._id}
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
        searchPlaceholder="Search name or email..."
        filters={
          <>
            <Select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="w-32"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Select>
            <Select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-32"
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </Select>
          </>
        }
      />
    </div>
  );
}
