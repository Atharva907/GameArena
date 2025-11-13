import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Trophy } from "lucide-react";

const TournamentCard = ({ tournament, onEdit, onDelete, getStatusColor, className }) => {
  return (
    <Card key={tournament._id} className={`overflow-hidden ${className || ""}`}>
      <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {tournament.imageUrl ? (
          <img 
            src={tournament.imageUrl} 
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <Trophy className="h-12 w-12" />
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{tournament.name}</CardTitle>
          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
            {tournament.status}
          </Badge>
        </div>
        <CardDescription>{tournament.game}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{tournament.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {tournament.startDate} - {tournament.endDate}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {tournament.startTime} - {tournament.endTime}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {tournament.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {tournament.currentParticipants}/{tournament.maxParticipants} participants
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {tournament.entryFee === "Free" ? "Free Entry" : `Entry: ${tournament.entryFee}`}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tournament.format}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tournament.platform}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tournament.region}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm font-medium">{tournament.prize} Prize Pool</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(tournament)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(tournament._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
