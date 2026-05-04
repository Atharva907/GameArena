"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/showToast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { apiFetch } from "@/lib/apiClient";

export default function MyAccount() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname || "/dashboard/my-account"}${
    searchParams?.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const loginHref = `${WEBSITE_LOGIN}?callback=${encodeURIComponent(currentPath)}`;

  const getSafeCallback = (value) => {
    if (!value || typeof value !== "string") return null;
    if (!value.startsWith("/") || value.startsWith("//")) return null;
    if (value.startsWith("/auth/")) return null;
    return value;
  };

  const returnTo = getSafeCallback(searchParams.get("callback"));

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    favoriteGame: "",
    city: "",
    state: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const normalizeProfileForForm = (profile) => ({
    ...profile,
    dateOfBirth: profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
      : "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch("/user/me");

        if (response.ok) {
          const responseData = await response.json();
          const userData = responseData.data || responseData;
          setUser(userData);

          if (userData.email) {
            localStorage.setItem("playerEmail", userData.email);
          }
        } else {
          router.replace(loginHref);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const playerEmail = localStorage.getItem("playerEmail");

        if (!playerEmail) {
          router.replace(loginHref);
        }
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [router, loginHref]);

  useEffect(() => {
    if (userLoading) return;

    const userEmail = user?.email || localStorage.getItem("playerEmail");

    if (userEmail) {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }

    const checkProfile = async () => {
      setIsLoading(true);

      try {
        if (userEmail) {
          const response = await apiFetch(`/player?email=${encodeURIComponent(userEmail)}`);
          const data = await response.json();

          if (response.ok) {
            setFormData(normalizeProfileForForm(data));
            setProfileExists(true);
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [user, userLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = profileExists ? "PUT" : "POST";
      const response = await apiFetch("/player", {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileExists(true);
        setIsEditMode(false);
        localStorage.setItem("playerEmail", formData.email);
        showToast(
          "success",
          profileExists ? "Profile updated successfully!" : "Profile created successfully!",
        );

        if (returnTo) {
          router.push(returnTo);
        }
      } else if (data.error && data.error.includes("already exists")) {
        const updateResponse = await apiFetch("/player", {
          method: "PUT",
          body: JSON.stringify(formData),
        });

        const updateData = await updateResponse.json();

        if (updateResponse.ok) {
          setProfileExists(true);
          setIsEditMode(false);
          localStorage.setItem("playerEmail", formData.email);
          showToast("success", "Profile updated successfully!");

          if (returnTo) {
            router.push(returnTo);
          }
        } else {
          showToast("error", updateData.error || "Failed to update profile");
        }
      } else {
        showToast("error", data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("error", "An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode((value) => !value);
  };

  if ((isLoading && !profileExists) || userLoading) {
    return (
      <div className="p-3 md:p-4">
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <p className="text-sm text-slate-400">Loading your profile...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-3 md:p-4 text-slate-100">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400">
          Profile
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
          {profileExists ? "My profile" : "Create your profile"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {profileExists ? "Update your gaming profile details." : "Add your player details to continue."}
        </p>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
        {!profileExists || isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  readOnly={!!user?.email || !!formData.email}
                  className={`border-slate-700 text-white placeholder:text-slate-500 ${
                    user?.email || formData.email
                      ? "bg-slate-950/20"
                      : "bg-slate-950/40"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-300">
                  Phone number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-slate-300">
                  Date of birth
                </Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="border-slate-700 bg-slate-950/40 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteGame" className="text-slate-300">
                  Favorite game
                </Label>
                <Input
                  id="favoriteGame"
                  name="favoriteGame"
                  value={formData.favoriteGame}
                  onChange={handleInputChange}
                  placeholder="Your favorite game"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-300">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-300">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-slate-300">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                  className="border-slate-700 bg-slate-950/40 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-sky-600 text-white hover:bg-sky-500"
              >
                {isLoading ? "Saving..." : profileExists ? "Update profile" : "Create profile"}
              </Button>

              {profileExists && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Full name", formData.fullName],
                ["Username", formData.username],
                ["Email", formData.email],
                ["Phone number", formData.phoneNumber],
                ["Date of birth", formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : ""],
                ["Favorite game", formData.favoriteGame],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-white">{value}</p>
                </div>
              ))}

              <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-3 md:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Location
                </p>
                <p className="mt-1 text-sm text-white">
                  {formData.city}, {formData.state}, {formData.country}
                </p>
              </div>
            </div>

            <Button
              onClick={toggleEditMode}
              className="bg-sky-600 text-white hover:bg-sky-500"
            >
              Edit profile
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
