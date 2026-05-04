"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentCard from "@/components/admin/TournamentCard";
import TournamentImageSelector from "@/components/Application/Admin/TournamentImageSelector";
import {
  AdminEmptyState,
  AdminHeader,
  AdminMetric,
  AdminPage,
  AdminPanel,
  adminFieldClass,
  adminGhostButtonClass,
  adminPrimaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/Application/Admin/AdminUi";
import { showToast } from "@/lib/showToast";
import { apiFetch } from "@/lib/apiClient";

const initialFormData = {
  name: "",
  description: "",
  game: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  maxParticipants: "",
  status: "upcoming",
  entryFee: "Free",
  region: "Global",
  format: "Solo",
  platform: "PC",
  prize: "",
  rules: "",
  imageUrl: "",
};

const statusTabs = [
  { value: "all", label: "All Tournaments" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
];

const normalizeTournaments = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const mapTournamentToForm = (tournament = {}) => ({
  name: tournament.name || "",
  description: tournament.description || "",
  game: tournament.game || "",
  startDate: tournament.startDate || "",
  endDate: tournament.endDate || "",
  startTime: tournament.startTime || "",
  endTime: tournament.endTime || "",
  location: tournament.location || "",
  maxParticipants: tournament.maxParticipants || "",
  status: tournament.status || "upcoming",
  entryFee: tournament.entryFee || "Free",
  region: tournament.region || "Global",
  format: tournament.format || "Solo",
  platform: tournament.platform || "PC",
  prize: tournament.prize || "",
  rules: tournament.rules || "",
  imageUrl: tournament.imageUrl || "",
});

function TournamentFormFields({ formData, onInputChange, onSelectChange, onImageChange }) {
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Tournament Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Enter tournament name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="game">Game</Label>
          <Input
            id="game"
            name="game"
            value={formData.game}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Enter game title"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          className={`w-full ${adminTextareaClass}`}
          placeholder="Outline the tournament theme, entry expectations, and event context."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={onInputChange}
            className={adminFieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={onInputChange}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={onInputChange}
            className={adminFieldClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={onInputChange}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Online, Mumbai LAN, Discord, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max Participants</Label>
          <Input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Enter participant cap"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(event) => onSelectChange(event.target.value, "status")}
            className={`w-full ${adminSelectClass}`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryFee">Entry Fee</Label>
          <Input
            id="entryFee"
            name="entryFee"
            value={formData.entryFee}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Free, $10, or 499 INR"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="region"
            value={formData.region}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Global, APAC, India, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <select
            id="format"
            value={formData.format}
            onChange={(event) => onSelectChange(event.target.value, "format")}
            className={`w-full ${adminSelectClass}`}
          >
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            value={formData.platform}
            onChange={(event) => onSelectChange(event.target.value, "platform")}
            className={`w-full ${adminSelectClass}`}
          >
            <option value="Mobile">Mobile</option>
            <option value="PC">PC</option>
            <option value="Console">Console</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize">Prize Pool</Label>
          <Input
            id="prize"
            name="prize"
            value={formData.prize}
            onChange={onInputChange}
            className={adminFieldClass}
            placeholder="Prize amount or reward details"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Rules</Label>
        <textarea
          id="rules"
          name="rules"
          value={formData.rules}
          onChange={onInputChange}
          className={`w-full ${adminTextareaClass}`}
          placeholder="Add the event rules, conduct, and match structure."
        />
      </div>

      <TournamentImageSelector value={formData.imageUrl} onChange={onImageChange} />
    </div>
  );
}

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    let isMounted = true;

    const loadTournaments = async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await apiFetch("/tournaments");

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to fetch tournaments");
        }

        const data = await response.json();

        if (isMounted) {
          setTournaments(normalizeTournaments(data));
          setError(null);
        }
      } catch (fetchError) {
        console.error("Error fetching tournaments:", fetchError);
        if (isMounted) {
          setTournaments([]);
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTournaments();

    const intervalId = setInterval(() => {
      void loadTournaments(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refreshKey]);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.game.trim() || !formData.startDate) {
      showToast("error", "Tournament name, game, and start date are required");
      return false;
    }

    return true;
  };

  const handleCreateTournament = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiFetch("/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: Number(formData.maxParticipants || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create tournament");
      }

      showToast("success", "Tournament created successfully");
      resetForm();
      setIsCreateModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (createError) {
      console.error("Error creating tournament:", createError);
      showToast("error", createError.message || "Failed to create tournament");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = async (tournament) => {
    try {
      const response = await apiFetch(`/tournaments/${tournament._id}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch tournament");
      }

      const latestTournament = await response.json();
      setSelectedTournament(latestTournament);
      setFormData(mapTournamentToForm(latestTournament));
      setIsEditModalOpen(true);
    } catch (fetchError) {
      console.error("Error fetching latest tournament data:", fetchError);
      setSelectedTournament(tournament);
      setFormData(mapTournamentToForm(tournament));
      setIsEditModalOpen(true);
    }
  };

  const handleEditTournament = async () => {
    if (!validateForm() || !selectedTournament?._id) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiFetch("/tournaments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedTournament._id,
          ...formData,
          maxParticipants: Number(formData.maxParticipants || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tournament");
      }

      showToast("success", "Tournament updated successfully");
      resetForm();
      setSelectedTournament(null);
      setIsEditModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      console.error("Error updating tournament:", updateError);
      showToast("error", updateError.message || "Failed to update tournament");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }

    try {
      const response = await apiFetch(`/tournaments?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tournament");
      }

      showToast("success", "Tournament deleted successfully");
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      console.error("Error deleting tournament:", deleteError);
      showToast("error", deleteError.message || "Failed to delete tournament");
    }
  };

  const filteredTournaments = useMemo(() => {
    if (activeTab === "all") {
      return tournaments;
    }

    return tournaments.filter((tournament) => tournament.status === activeTab);
  }, [activeTab, tournaments]);

  const metrics = useMemo(() => {
    const liveCount = tournaments.filter((tournament) => tournament.status === "live").length;
    const upcomingCount = tournaments.filter(
      (tournament) => tournament.status === "upcoming",
    ).length;
    const completedCount = tournaments.filter(
      (tournament) => tournament.status === "completed",
    ).length;
    const totalParticipants = tournaments.reduce(
      (sum, tournament) => sum + Number(tournament.currentParticipants || 0),
      0,
    );

    return {
      liveCount,
      upcomingCount,
      completedCount,
      totalParticipants,
    };
  }, [tournaments]);

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Tournaments"
        title="Run event operations from a calmer control surface"
        description="Create, update, and track tournaments with a consistent card system, straightforward form dialogs, and a simple professional palette."
        chips={["Events", "Brackets", "Registrations"]}
        actions={
          <Dialog
            open={isCreateModalOpen}
            onOpenChange={(open) => {
              setIsCreateModalOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className={adminPrimaryButtonClass}>
                <CalendarPlus className="size-4" />
                Add Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Tournament</DialogTitle>
                <DialogDescription>
                  Add a new event using the same standard admin structure used
                  throughout the control panel.
                </DialogDescription>
              </DialogHeader>

              <TournamentFormFields
                formData={formData}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onImageChange={(value) =>
                  setFormData((prev) => ({ ...prev, imageUrl: value }))
                }
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className={adminGhostButtonClass}
                  onClick={() => {
                    resetForm();
                    setIsCreateModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className={adminPrimaryButtonClass}
                  onClick={handleCreateTournament}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Tournament"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Tournaments"
          value={tournaments.length}
          detail="Events currently listed in the admin workspace"
          icon={Trophy}
          accent="from-sky-500/20 via-sky-500/5 to-transparent"
        />
        <AdminMetric
          label="Live now"
          value={metrics.liveCount}
          detail="Events currently in progress"
          icon={Zap}
          accent="from-emerald-500/20 via-emerald-500/5 to-transparent"
        />
        <AdminMetric
          label="Upcoming"
          value={metrics.upcomingCount}
          detail="Scheduled events waiting to start"
          icon={CalendarPlus}
          accent="from-amber-500/20 via-amber-500/5 to-transparent"
        />
        <AdminMetric
          label="Participants"
          value={metrics.totalParticipants}
          detail={`${metrics.completedCount} completed events in the archive`}
          icon={Users}
          accent="from-fuchsia-500/20 via-fuchsia-500/5 to-transparent"
        />
      </section>

      <AdminPanel
        title="Tournament directory"
        description="Filter the event list by status and manage each event from a cleaner card-based layout."
      >
        {loading ? (
          <div className="py-12 text-sm text-muted-foreground">
            Loading tournaments...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            Error: {error}
          </div>
        ) : tournaments.length === 0 ? (
          <AdminEmptyState
            title="No tournaments yet"
            description="Create the first tournament to start managing events from the admin workspace."
            action={
              <Button
                type="button"
                className={adminPrimaryButtonClass}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Tournament
              </Button>
            }
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-[20px] border border-border/60 bg-muted/20 p-0.5 sm:grid-cols-4">
              {statusTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-[16px] py-1.5 text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {statusTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                {filteredTournaments.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTournament}
                      />
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState
                    title={`No ${tab.label.toLowerCase()} found`}
                    description="Adjust the current filter or create another tournament."
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </AdminPanel>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            resetForm();
            setSelectedTournament(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>
              Update tournament details without leaving the event directory.
            </DialogDescription>
          </DialogHeader>

          <TournamentFormFields
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onImageChange={(value) =>
              setFormData((prev) => ({ ...prev, imageUrl: value }))
            }
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className={adminGhostButtonClass}
              onClick={() => {
                resetForm();
                setSelectedTournament(null);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={adminPrimaryButtonClass}
              onClick={handleEditTournament}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Update Tournament"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
};

export default TournamentsPage;
