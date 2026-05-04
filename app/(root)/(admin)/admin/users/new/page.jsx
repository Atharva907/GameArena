"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminSecurityNote,
  adminFieldClass,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminTextareaClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";

const AddUserPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create user");
      }

      showToast("success", "User created successfully");
      router.push("/admin/users");
    } catch (submitError) {
      console.error("Error creating user:", submitError);
      showToast("error", submitError.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="New User"
        title="Create a managed platform account"
        description="Add an admin-managed user with clean defaults, clear validation, and a standard form layout that works on every device."
        chips={["Account creation", "Roles", "Secure defaults"]}
        actions={<AdminBackLink href="/admin/users">Back to Users</AdminBackLink>}
      />

      <AdminSecurityNote />

      <AdminPanel
        title="User information"
        description="Fill in the details below to create a new account."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? `${adminFieldClass} border-rose-500` : adminFieldClass}
              />
              {errors.name && <p className="text-sm text-rose-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? `${adminFieldClass} border-rose-500` : adminFieldClass}
              />
              {errors.email && <p className="text-sm text-rose-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className={
                  errors.password ? `${adminFieldClass} border-rose-500` : adminFieldClass
                }
              />
              {errors.password && (
                <p className="text-sm text-rose-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className={adminFieldClass}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full ${adminTextareaClass}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger
                  id="role"
                  className={
                    errors.role ? `${adminFieldClass} border-rose-500` : adminFieldClass
                  }
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-rose-500">{errors.role}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
            <Button asChild variant="outline" className={adminGhostButtonClass}>
              <Link href="/admin/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading} className={adminPrimaryButtonClass}>
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="size-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </AdminPanel>
    </AdminPage>
  );
};

export default AddUserPage;
