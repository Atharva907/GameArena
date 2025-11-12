"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Clock, Trophy, Users, MapPin } from "lucide-react";
import TournamentCard from "@/components/ui/tournament-card";

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [formData, setFormData] = useState({
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
    imageUrl: ""
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments');
        if (!response.ok) throw new Error('Failed to fetch tournaments');
        const data = await response.json();
        setTournaments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setTournaments([]);
      }
    };

    fetchTournaments();
    const intervalId = setInterval(fetchTournaments, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (!isEditModalOpen && selectedTournament) {
      const refreshTournaments = async () => {
        try {
          const response = await fetch('/api/tournaments');
          if (response.ok) {
            const data = await response.json();
            setTournaments(data);
          }
        } catch (error) {
          console.error("Error refreshing tournaments:", error);
        }
      };
      refreshTournaments();
    }
  }, [isEditModalOpen, selectedTournament]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
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
      imageUrl: ""
    });
  };

  const handleCreateTournament = async () => {
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create tournament');
      const newTournament = await response.json();
      setTournaments([...tournaments, newTournament]);
      resetForm();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Failed to create tournament. Please try again.");
    }
  };

  const handleEditTournament = async () => {
    try {
      const updateData = { id: selectedTournament._id, ...formData };
      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update tournament');
      const updatedTournament = await response.json();
      
      const tournamentIndex = tournaments.findIndex(t => t._id === updatedTournament._id);
      if (tournamentIndex !== -1) {
        const newTournaments = [...tournaments];
        newTournaments[tournamentIndex] = updatedTournament;
        setTournaments(newTournaments);
      }
      
      resetForm();
      setIsEditModalOpen(false);
      setSelectedTournament(null);
    } catch (error) {
      console.error("Error updating tournament:", error);
      alert("Failed to update tournament. Please try again.");
    }
  };

  const handleDeleteTournament = async (id) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        const response = await fetch(`/api/tournaments?id=${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete tournament');
        setTournaments(tournaments.filter(tournament => tournament._id !== id));
      } catch (error) {
        console.error("Error deleting tournament:", error);
        alert("Failed to delete tournament. Please try again.");
      }
    }
  };

  const openEditModal = async (tournament) => {
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}`);
      if (response.ok) {
        const latestTournament = await response.json();
        setSelectedTournament(latestTournament);
        setFormData({
          name: latestTournament.name,
          description: latestTournament.description,
          game: latestTournament.game,
          startDate: latestTournament.startDate,
          endDate: latestTournament.endDate,
          startTime: latestTournament.startTime,
          endTime: latestTournament.endTime,
          location: latestTournament.location,
          maxParticipants: latestTournament.maxParticipants,
          status: latestTournament.status,
          entryFee: latestTournament.entryFee || "Free",
          region: latestTournament.region || "Global",
          format: latestTournament.format || "Solo",
          platform: latestTournament.platform || "PC",
          prize: latestTournament.prize,
          rules: latestTournament.rules,
          imageUrl: latestTournament.imageUrl
        });
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      setSelectedTournament(tournament);
      setFormData({
        name: tournament.name,
        description: tournament.description,
        game: tournament.game,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        startTime: tournament.startTime,
        endTime: tournament.endTime,
        location: tournament.location,
        maxParticipants: tournament.maxParticipants,
        status: tournament.status,
        entryFee: tournament.entryFee || "Free",
        region: tournament.region || "Global",
        format: tournament.format || "Solo",
        platform: tournament.platform || "PC",
        prize: tournament.prize,
        rules: tournament.rules,
        imageUrl: tournament.imageUrl
      });
    }
    setIsEditModalOpen(true);
  };

  const filterTournaments = (status) => {
    if (status === "all") return tournaments;
    return tournaments.filter(tournament => tournament.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live": return "bg-green-500";
      case "upcoming": return "bg-blue-500";
      case "completed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground">Manage gaming tournaments</p>
        </div>
      </div>
      
      <div className="fixed top-20 right-8 z-40">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 rounded-md h-10 px-4 shadow-lg">
              <Plus className="h-4 w-4" />
              <span>Add Tournament</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>Fill in the details to create a new tournament.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Form fields remain the same */}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateTournament}>
                Create Tournament
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tournaments</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterTournaments("all").map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                onEdit={openEditModal}
                onDelete={handleDeleteTournament}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterTournaments("live").map((tournament) => (
              <div key={tournament._id} className="relative">
                <Badge className="absolute top-2 right-2 z-10 bg-green-500 text-white">LIVE NOW</Badge>
                <TournamentCard
                  tournament={tournament}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTournament}
                  getStatusColor={getStatusColor}
                  className="border-green-500"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterTournaments("upcoming").map((tournament) => (
              <div key={tournament._id} className="relative">
                <Badge className="absolute top-2 right-2 z-10 bg-blue-500 text-white">UPCOMING</Badge>
                <TournamentCard
                  tournament={tournament}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTournament}
                  getStatusColor={getStatusColor}
                  className="border-blue-500"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterTournaments("completed").map((tournament) => (
              <div key={tournament._id} className="relative">
                <Badge className="absolute top-2 right-2 z-10 bg-gray-500 text-white">COMPLETED</Badge>
                <TournamentCard
                  tournament={tournament}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTournament}
                  getStatusColor={getStatusColor}
                  className="opacity-75 border-gray-500"
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>Update the tournament details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Edit form fields remain the same */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditTournament}>
              Update Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentsPage;