import TournamentBracket from "@/components/tournaments/TournamentBracket";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
  AdminPanel,
} from "@/components/Application/Admin/AdminUi";

export default async function AdminTournamentBracketPage({ params }) {
  const { id } = await params;

  return (
    <AdminPage>
      <AdminHeader
        eyebrow="Tournament Bracket"
        title="Match scheduling and result verification"
        description="Generate a single-elimination bracket from registered participants, schedule matches, verify scores, and publish standings."
        chips={["Matches", "Standings", "Results"]}
        actions={<AdminBackLink href="/admin/tournaments">Back to tournaments</AdminBackLink>}
      />

      <AdminPanel>
        <TournamentBracket tournamentId={id} admin />
      </AdminPanel>
    </AdminPage>
  );
}
