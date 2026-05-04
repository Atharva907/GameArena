"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Trash2, UserPlus, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/apiClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminEmptyState,
  AdminHeader,
  AdminMetric,
  AdminPage,
  AdminPanel,
  AdminStatusBadge,
  adminFieldClass,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminTableWrapClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NA";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers(searchTerm, currentPage);
  }, [currentPage, searchTerm]);

  const fetchUsers = async (searchValue = "", page = 1) => {
    try {
      setLoading(true);
      const searchQuery = searchValue
        ? `&search=${encodeURIComponent(searchValue)}`
        : "";
      const response = await apiFetch(`/users?page=${page}&limit=10${searchQuery}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.data.users || []);
      setTotalPages(data.data.pagination.pages || 1);
      setTotalUsers(data.data.pagination.total || 0);
      setError(null);
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await apiFetch(`/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user");
      }

      showToast("success", "User deleted successfully");
      fetchUsers(searchTerm, currentPage);
    } catch (deleteError) {
      console.error("Error deleting user:", deleteError);
      showToast("error", deleteError.message || "Failed to delete user");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearchTerm(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
    setSearchTerm("");
  };

  const metrics = useMemo(() => {
    const visibleAdmins = users.filter((user) => user.role === "admin").length;
    const visibleStandardUsers = users.filter((user) => user.role !== "admin").length;
    const visibleVerified = users.filter((user) => user.isEmailVerified).length;

    return {
      visibleAdmins,
      visibleStandardUsers,
      visibleVerified,
    };
  }, [users]);

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Users"
        title="Manage platform accounts with less visual noise"
        description="Search accounts, review roles, and clean up records from a standard user directory that stays readable on every screen size."
        chips={["Accounts", "Roles", "Responsive table"]}
        actions={
          <Button asChild className={adminPrimaryButtonClass}>
            <Link href="/admin/users/new">
              <UserPlus className="size-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Total users"
          value={totalUsers}
          detail="All active user records in the system"
          icon={Users2}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Visible admins"
          value={metrics.visibleAdmins}
          detail="Admin accounts on the current page"
          icon={ShieldCheck}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
        <AdminMetric
          label="Visible users"
          value={metrics.visibleStandardUsers}
          detail="Standard accounts on the current page"
          icon={Users2}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
        <AdminMetric
          label="Verified on page"
          value={metrics.visibleVerified}
          detail="Accounts with verified email status in view"
          icon={ShieldCheck}
          accent="from-amber-500/20 via-amber-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Directory filters"
        description="Search by name, email, or phone number."
      >
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className={`pl-11 ${adminFieldClass}`}
            />
          </div>
          <Button type="submit" className={adminPrimaryButtonClass}>
            Search
          </Button>
          {searchTerm && (
            <Button
              type="button"
              variant="outline"
              className={adminGhostButtonClass}
              onClick={clearSearch}
            >
              Clear
            </Button>
          )}
        </form>
      </AdminPanel>

      <AdminPanel
        title="Managed accounts"
        description="Review account details, role assignments, and join dates from one responsive directory."
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">Loading users...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            Error: {error}
          </div>
        ) : users.length === 0 ? (
          <AdminEmptyState
            title="No users found"
            description="Adjust the search filters or create the first admin-managed user account."
            action={
              <Button asChild className={adminPrimaryButtonClass}>
                <Link href="/admin/users/new">Create User</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className={`hidden lg:block ${adminTableWrapClass}`}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 ring-1 ring-border/60">
                            <AvatarImage src={user.avatar?.url} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {user.isEmailVerified ? "Email verified" : "Email unverified"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "Not provided"}</TableCell>
                      <TableCell>
                        <AdminStatusBadge status={user.role || "user"} />
                      </TableCell>
                      <TableCell>{dateFormatter.format(new Date(user.createdAt))}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {users.map((user) => (
                <div
                  key={`${user._id}-mobile`}
                  className="rounded-[24px] border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="size-14 ring-1 ring-border/60">
                      <AvatarImage src={user.avatar?.url} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="mt-1 break-all text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <AdminStatusBadge status={user.role || "user"} />
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{user.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-medium">
                            {dateFormatter.format(new Date(user.createdAt))}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        {user.isEmailVerified ? "Email verified" : "Email unverified"}
                      </p>

                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-full border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete user
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className={adminGhostButtonClass}
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className={adminGhostButtonClass}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </AdminPanel>
    </AdminPage>
  );
};

export default UsersPage;
