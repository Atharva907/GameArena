"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, MapPin, Clock, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStatusColor } from "@/lib/esportUtils";

export default function MyTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRegisteredTournaments = async () => {
      try {
        const response = await fetch("/api/player/registrations");
        if (!response.ok) {
          throw new Error("Failed to fetch registered tournaments");
        }
        const data = await response.json();
        const tournamentsData = data.data || data;
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      } catch (error) {
        console.error("Error fetching registered tournaments:", error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredTournaments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Trophy className="h-16 w-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tournaments Yet</h3>
          <p className="text-gray-400 text-center mb-6">You haven't registered for any tournaments yet.</p>
          <button
            onClick={() => router.push("/dashboard/tournaments")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Browse Tournaments
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map((tournament) => (
        <Card key={tournament._id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-slate-800 border-slate-700 text-white h-full flex flex-col">
          <div className="relative h-40 overflow-hidden">
            {tournament.imageUrl ? (
              <img 
                src={tournament.imageUrl} 
                alt={tournament.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/images/tournaments/placeholder.jpg";
                }}
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-16 w-16 text-white opacity-50" />
                </div>
              </>
            )}
            <div className="absolute top-3 right-3">
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status}
              </Badge>
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-slate-900/70 text-white border-slate-600">
                {tournament.game}
              </Badge>
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl line-clamp-1">{tournament.name}</CardTitle>
            <CardDescription className="text-gray-300 text-sm line-clamp-2">
              {tournament.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{tournament.startDate} - {tournament.endDate}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4" />
              <span>{tournament.startTime} - {tournament.endTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{tournament.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span>{tournament.format}</span>
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Entry Fee</span>
                <span className="font-semibold text-green-400">{tournament.entryFee || "Free"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Prize Pool</span>
                <span className="font-semibold text-yellow-400">{tournament.prize || "N/A"}</span>
              </div>
            </div>
          </CardContent>
          <div className="p-4 pt-0">
            <button
              onClick={() => router.push(`/tournaments/${tournament._id}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Details
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
