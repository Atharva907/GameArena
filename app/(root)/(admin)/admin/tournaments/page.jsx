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
import TournamentCard from "@/components/admin/TournamentCard";

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [testResults, setTestResults] = useState(null);
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

  // Fetch tournaments from API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments');
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments');
        }
        const data = await response.json();
        console.log("Fetched tournaments:", data);
        const tournamentsData = data.data || data;
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setTournaments([]);
      }
    };

    fetchTournaments();
    
    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(fetchTournaments, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Refresh tournaments when edit modal is closed
  useEffect(() => {
    if (!isEditModalOpen && selectedTournament) {
      const refreshTournaments = async () => {
        try {
          const response = await fetch('/api/tournaments');
          if (response.ok) {
            const data = await response.json();
            console.log("Refreshed tournaments after closing edit modal:", data);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create tournament');
      }

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
      const updateData = {
        id: selectedTournament._id,
        ...formData
      };
      console.log("Sending update request with data:", updateData);
      
      const response = await fetch('/api/tournaments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        console.error("API response not OK:", response.status, response.statusText);
        throw new Error('Failed to update tournament');
      }

      const updatedTournament = await response.json();
      console.log("Received updated tournament from API:", updatedTournament);
      
      const updatedTournaments = tournaments.map(tournament => {
        if (tournament._id === selectedTournament._id) {
          console.log("Updating tournament in local state:", tournament._id);
          return updatedTournament;
        }
        return tournament;
      });
      // Find the index of the tournament in the original tournaments array
      const tournamentIndex = tournaments.findIndex(t => t._id === updatedTournament._id);
      
      if (tournamentIndex !== -1) {
        // Create a new array with the updated tournament
        const newTournaments = [...tournaments];
        newTournaments[tournamentIndex] = updatedTournament;
        setTournaments(newTournaments);
        console.log("Updated tournament in local state at index:", tournamentIndex);
      } else {
        // Fallback to the original approach if the tournament is not found
        setTournaments(updatedTournaments);
      }
      
      // Refresh tournaments from database to ensure we have the latest data
      try {
        const refreshResponse = await fetch('/api/tournaments');
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          console.log("Refreshed tournaments from database:", refreshedData);
          setTournaments(refreshedData);
        }
      } catch (refreshError) {
        console.error("Error refreshing tournaments:", refreshError);
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

        if (!response.ok) {
          throw new Error('Failed to delete tournament');
        }

        setTournaments(tournaments.filter(tournament => tournament._id !== id));
      } catch (error) {
        console.error("Error deleting tournament:", error);
        alert("Failed to delete tournament. Please try again.");
      }
    }
  };

  const openEditModal = async (tournament) => {
    console.log("Opening edit modal for tournament:", tournament);
    
    try {
      // Fetch the latest tournament data from the database
      const response = await fetch(`/api/tournaments/${tournament._id}`);
      
      if (response.ok) {
        const latestTournament = await response.json();
        console.log("Fetched latest tournament data:", latestTournament);
        
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
      } else {
        // If fetching fails, use the provided tournament data
        console.error("Failed to fetch latest tournament data, using provided data");
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
    } catch (error) {
      console.error("Error fetching latest tournament data:", error);
      // If fetching fails, use the provided tournament data
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

  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...");
      const response = await fetch("/api/test-db");
      const data = await response.json();
      console.log("Database test results:", data);
      setTestResults(data);
      
      // Also test the update operation
      console.log("Testing update operation...");
      const updateResponse = await fetch("/api/test-update");
      const updateData = await updateResponse.json();
      console.log("Update test results:", updateData);
      setTestResults(prev => ({ ...prev, updateTest: updateData }));
    } catch (error) {
      console.error("Error testing database:", error);
      setTestResults({ error: error.message });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
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
      
      {/* Fixed Add Tournament Button */}
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
              <DialogDescription>
                Fill in the details to create a new tournament.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter tournament name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game">Game</Label>
                  <Input
                    id="game"
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    placeholder="Enter game name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter tournament description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder="Enter max participants"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, "status")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    value={formData.entryFee}
                    onChange={handleInputChange}
                    placeholder="Enter entry fee (e.g., Free, $10)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Enter region (e.g., Global, NA, EU)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, "format")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Duo">Duo</SelectItem>
                      <SelectItem value="Squad">Squad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, "platform")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="PC">PC</SelectItem>
                      <SelectItem value="Console">Console</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize Pool</Label>
                  <Input
                    id="prize"
                    name="prize"
                    value={formData.prize}
                    onChange={handleInputChange}
                    placeholder="Enter prize amount"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rules">Rules</Label>
                <Textarea
                  id="rules"
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="Enter tournament rules"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Enter image URL"
                />
              </div>
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

      {/* Edit Tournament Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription>
              Update the tournament details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tournament Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter tournament name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-game">Game</Label>
                <Input
                  id="edit-game"
                  name="game"
                  value={formData.game}
                  onChange={handleInputChange}
                  placeholder="Enter game name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter tournament description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                <Input
                  id="edit-maxParticipants"
                  name="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="Enter max participants"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select onValueChange={(value) => handleSelectChange(value, "status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entryFee">Entry Fee</Label>
                <Input
                  id="edit-entryFee"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  placeholder="Enter entry fee (e.g., Free, $10)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Input
                  id="edit-region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="Enter region (e.g., Global, NA, EU)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-format">Format</Label>
                <Select onValueChange={(value) => handleSelectChange(value, "format")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-platform">Platform</Label>
                <Select onValueChange={(value) => handleSelectChange(value, "platform")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="Console">Console</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prize">Prize Pool</Label>
                <Input
                  id="edit-prize"
                  name="prize"
                  value={formData.prize}
                  onChange={handleInputChange}
                  placeholder="Enter prize amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rules">Rules</Label>
              <Textarea
                id="edit-rules"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="Enter tournament rules"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
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