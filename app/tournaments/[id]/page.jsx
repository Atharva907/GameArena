"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, ArrowLeft, UserCheck, UserPlus } from "lucide-react";
import { getStatusColor } from "@/lib/esportUtils";

export default function TournamentPage() {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id;

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const [tournamentResponse, registrationResponse] = await Promise.all([
          fetch(`/api/tournaments/${tournamentId}`),
          fetch(`/api/tournament/${tournamentId}/registration`)
        ]);

        if (!tournamentResponse.ok) {
          throw new Error("Failed to fetch tournament details");
        }

        const tournamentData = await tournamentResponse.json();
        setTournament(tournamentData.data || tournamentData);

        if (registrationResponse.ok) {
          const registrationData = await registrationResponse.json();
          setTournament(prev => ({
            ...prev,
            registrationDetails: registrationData
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <h3 className="text-xl font-semibold mb-2">Error Loading Tournament</h3>
          <p className="text-gray-400 text-center mb-6">{error || "Tournament not found"}</p>
          <Button onClick={() => router.push("/tournaments")} className="bg-purple-600 hover:bg-purple-700">
            Browse All Tournaments
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleRegister = async () => {
    try {
      const response = await fetch(`/api/tournament/${tournamentId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to register for tournament");
      }

      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/my-tournaments")}
          className="mb-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 text-white hover:bg-slate-700/50 transition-all duration-200 shadow-lg"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Tournaments
        </Button>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white overflow-hidden shadow-2xl">
          {/* Tournament Header with Image */}
          <div className="relative h-64 md:h-80 overflow-hidden group">
            {tournament.imageUrl ? (
              <>
                <img 
                  src={tournament.imageUrl} 
                  alt={tournament.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/images/tournaments/placeholder.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-90"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-32 w-32 text-white/20" />
                </div>
              </>
            )}
            
            {/* Status and Game Badges */}
            <div className="absolute top-6 right-6">
              <Badge className={`${getStatusColor(tournament.status)} text-sm px-3 py-1 shadow-lg backdrop-blur-sm`}>
                {tournament.status}
              </Badge>
            </div>
            <div className="absolute top-6 left-6">
              <Badge variant="outline" className="bg-slate-900/70 text-white border-slate-600 text-sm px-3 py-1 shadow-lg backdrop-blur-sm">
                {tournament.game}
              </Badge>
            </div>
            
            {/* Tournament Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{tournament.currentParticipants}/{tournament.maxParticipants} Players</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{tournament.startDate}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="space-y-8 p-6 md:p-8">
            {/* Tournament Description */}
            <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-purple-400 flex items-center gap-2">
                <div className="h-1 w-6 bg-purple-400 rounded-full"></div>
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
            </div>

            {/* Tournament Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="font-medium">{tournament.startDate} - {tournament.endDate}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="font-medium">{tournament.startTime} - {tournament.endTime}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <MapPin className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-medium">{tournament.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Format</p>
                      <p className="font-medium">{tournament.format}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Trophy className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Prize Pool</p>
                      <p className="text-yellow-400 font-bold text-lg">{tournament.prize || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <div className="h-6 w-6 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Entry Fee</p>
                      <p className="text-green-400 font-bold text-lg">{tournament.entryFee || "Free"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {tournament.rules && (
            <div className="bg-slate-700/30 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
                <div className="h-1 w-6 bg-purple-400 rounded-full"></div>
                Rules & Regulations
              </h3>
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-600/50">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{tournament.rules}</p>
              </div>
            </div>
          )}

          {tournament.registrationDetails && (
            <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
                <div className="h-1 w-6 bg-purple-400 rounded-full"></div>
                Registration Details
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Player Name</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.playerName}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium truncate">{tournament.registrationDetails.playerEmail}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Contact Number</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.contactNumber}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.dateOfBirth}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">City</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.city}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">State</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.state}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Team Name</p>
                  <p className="text-white font-medium">{tournament.registrationDetails.teamName}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${tournament.registrationDetails.paid ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <p className={`font-medium ${tournament.registrationDetails.paid ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tournament.registrationDetails.paid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/30 transition-all duration-300 shadow-md hover:shadow-lg">
                  <p className="text-sm text-gray-400 mb-1">Registration Date</p>
                  <p className="text-white font-medium">
                    {tournament.registrationDetails.createdAt 
                      ? new Date(tournament.registrationDetails.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
