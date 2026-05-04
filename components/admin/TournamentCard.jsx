import Link from "next/link";
import {
  Calendar,
  Clock,
  Edit,
  GitBranch,
  MapPin,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AdminStatusBadge,
  adminSurfaceClass,
} from "@/components/Application/Admin/AdminUi";

const formatDate = (value) => {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const TournamentCard = ({ tournament, onEdit, onDelete, className = "" }) => {
  return (
    <Card className={`${adminSurfaceClass} gap-0 overflow-hidden py-0 ${className}`}>
      <div className="relative aspect-[16/7] overflow-hidden border-b border-border bg-muted/30">
        {tournament.imageUrl ? (
          <img
            src={tournament.imageUrl}
            alt={tournament.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Trophy className="size-8" />
          </div>
        )}

        <div className="absolute right-3 top-3">
          <AdminStatusBadge status={tournament.status || "upcoming"}>
            {tournament.status || "upcoming"}
          </AdminStatusBadge>
        </div>
      </div>

      <CardHeader className="gap-1.5 px-3.5 py-3 pb-2">
        <div className="min-w-0">
          <CardTitle className="truncate text-sm font-semibold tracking-tight">
            {tournament.name}
          </CardTitle>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{tournament.game}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-3.5 pb-3 pt-0">
        <p className="line-clamp-2 text-[11px] leading-5 text-muted-foreground">
          {tournament.description || "No tournament description provided yet."}
        </p>

        <div className="grid gap-1.5 text-[11px] leading-5 text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            <span>
              {formatDate(tournament.startDate)}
              {tournament.endDate ? ` - ${formatDate(tournament.endDate)}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            <span>
              {tournament.startTime || "TBD"}
              {tournament.endTime ? ` - ${tournament.endTime}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span>{tournament.location || "Location to be announced"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            <span>
              {tournament.currentParticipants || 0}/{tournament.maxParticipants || 0}{" "}
              participants
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tournament.entryFee === "Free"
              ? "Free entry"
              : `Entry: ${tournament.entryFee}`}
          </span>
          <span className="rounded-md border border-border bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tournament.format || "Format TBD"}
          </span>
          <span className="rounded-md border border-border bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tournament.platform || "Platform TBD"}
          </span>
          <span className="rounded-md border border-border bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tournament.region || "Global"}
          </span>
          <span className="rounded-md border border-border bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground">
            {tournament.prize || "Prize TBD"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-1.5 px-3.5 pb-3 pt-0">
        <Button
          asChild
          type="button"
          variant="outline"
          className="h-8 flex-1 rounded-lg border-border/80 bg-background px-2 text-[12px] font-medium hover:bg-accent"
        >
          <Link href={`/admin/tournaments/${tournament._id}/bracket`}>
            <GitBranch className="size-3.5" />
            Bracket
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 flex-1 rounded-lg border-border/80 bg-background px-2 text-[12px] font-medium hover:bg-accent"
          onClick={() => onEdit(tournament)}
        >
          <Edit className="size-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 flex-1 rounded-lg border-rose-200 bg-rose-50 px-2 text-[12px] font-medium text-rose-700 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          onClick={() => onDelete(tournament._id)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
