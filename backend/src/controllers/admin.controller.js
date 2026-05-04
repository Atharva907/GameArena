import { countUserRecords, listUserRecords } from "../lib/accountStore.js";
import {
  countOrderRecords,
  countProductRecords,
  listLowStockProductRecords,
  listRecentOrderRecords,
  sumOrderRevenue,
} from "../lib/commerceStore.js";
import { listTournamentRecords } from "../lib/tournamentStore.js";

export async function getAdminOverview(_req, res) {
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    featuredProducts,
    lowStockProducts,
    recentUsers,
    recentOrders,
    revenueTotal,
    tournamentRecords,
    liveTournamentRecords,
  ] =
    await Promise.all([
      countProductRecords(),
      countOrderRecords(),
      countUserRecords(),
      countProductRecords({ featured: true }),
      listLowStockProductRecords(5),
      listUserRecords({ page: 1, limit: 5 }).then((result) => result.users),
      listRecentOrderRecords(5),
      sumOrderRevenue(),
      listTournamentRecords(),
      listTournamentRecords({ status: "live" }),
    ]);

  res.json({
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalTournaments: tournamentRecords.length,
      featuredProducts,
      liveTournaments: liveTournamentRecords.length,
      totalRevenue: revenueTotal,
      lowStockCount: lowStockProducts.length,
    },
    lowStockProducts,
    recentUsers,
    recentOrders,
    recentTournaments: tournamentRecords.slice(0, 4),
  });
}
