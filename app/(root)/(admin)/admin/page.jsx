import Link from "next/link";
import {
  Boxes,
  CircleDollarSign,
  PackagePlus,
  ShoppingBag,
  Trophy,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminCardAction,
  AdminEmptyState,
  AdminHeader,
  AdminMetric,
  AdminPage,
  AdminPanel,
  AdminStatusBadge,
  adminPrimaryButtonClass,
} from "@/components/Application/Admin/AdminUi";
import { serverApiFetch } from "@/lib/serverApiClient";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const getStatusClasses = (status) => {
  switch (status) {
    case "delivered":
    case "completed":
    case "live":
      return "text-emerald-700 dark:text-emerald-300";
    case "processing":
    case "confirmed":
    case "upcoming":
      return "text-amber-700 dark:text-amber-300";
    case "cancelled":
      return "text-rose-700 dark:text-rose-300";
    default:
      return "text-muted-foreground";
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "No date";
  }

  return dateFormatter.format(new Date(dateValue));
};

const getAdminOverview = async () => {
  try {
    const response = await serverApiFetch("/admin/overview");

    if (!response.ok) {
      throw new Error("Failed to load admin overview");
    }

    const overview = await response.json();

    return {
      stats: overview.stats,
      lowStockProducts: overview.lowStockProducts || [],
      recentUsers: overview.recentUsers || [],
      recentOrders: overview.recentOrders || [],
      recentTournaments: overview.recentTournaments || [],
      error: null,
    };
  } catch (error) {
    console.error("Error loading admin overview:", error);

    return {
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalTournaments: 0,
        featuredProducts: 0,
        liveTournaments: 0,
        totalRevenue: 0,
        lowStockCount: 0,
      },
      lowStockProducts: [],
      recentUsers: [],
      recentOrders: [],
      recentTournaments: [],
      error:
        "The dashboard could not load the latest platform data. Check the database connection and refresh.",
    };
  }
};

const quickActions = [
  {
    title: "Add product",
    description: "Create a new catalog item with pricing and stock.",
    href: "/admin/products/new",
    icon: PackagePlus,
  },
  {
    title: "Review orders",
    description: "Open the order queue and update statuses.",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Create tournament",
    description: "Add a new event and manage registrations.",
    href: "/admin/tournaments",
    icon: Trophy,
  },
  {
    title: "Add user",
    description: "Create a managed admin or staff account.",
    href: "/admin/users/new",
    icon: UserPlus,
  },
];

export default async function AdminDashboardPage() {
  const { stats, lowStockProducts, recentUsers, recentOrders, recentTournaments, error } =
    await getAdminOverview();

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Dashboard"
        title="Platform overview"
        description="A simple summary of products, orders, users, tournaments, and the items that need attention."
        chips={[
          `${stats.totalProducts} products`,
          `${stats.totalOrders} orders`,
          `${stats.totalTournaments} tournaments`,
        ]}
        actions={
          <Button asChild className={adminPrimaryButtonClass}>
            <Link href="/admin/products/new">
              <PackagePlus className="size-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      {error && (
        <AdminPanel>
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        </AdminPanel>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Products"
          value={stats.totalProducts.toLocaleString("en-US")}
          detail={`${stats.featuredProducts} featured, ${stats.lowStockCount} low stock`}
          icon={Boxes}
          accent="sky"
        />
        <AdminMetric
          label="Orders"
          value={stats.totalOrders.toLocaleString("en-US")}
          detail="Recent purchases and order states"
          icon={ShoppingBag}
          accent="amber"
        />
        <AdminMetric
          label="Revenue"
          value={currencyFormatter.format(stats.totalRevenue)}
          detail="Gross wallet-store sales"
          icon={CircleDollarSign}
          accent="emerald"
        />
        <AdminMetric
          label="Users"
          value={stats.totalUsers.toLocaleString("en-US")}
          detail={`${stats.liveTournaments} live tournaments right now`}
          icon={Users}
          accent="fuchsia"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <AdminPanel
          title="Quick actions"
          description="Common admin tasks without the extra presentation layer."
          className="xl:col-span-5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <AdminCardAction key={action.title} {...action} />
            ))}
          </div>
        </AdminPanel>

        <AdminPanel
          title="Recent orders"
          description="Latest purchases and their current status."
          className="xl:col-span-7"
        >
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href="/admin/orders"
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        Order #{String(order._id).slice(-6).toUpperCase()}
                      </p>
                      <AdminStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.player?.fullName || order.player?.email || "Player"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm sm:block sm:text-right">
                    <p className="font-medium">
                      {currencyFormatter.format(order.totalAmount)}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="No orders yet"
              description="Recent orders will appear here once purchases start coming in."
            />
          )}
        </AdminPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <AdminPanel
          title="Inventory watch"
          description="Products with the lowest stock count."
          className="xl:col-span-4"
        >
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-md border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {currencyFormatter.format(product.price)}
                      </p>
                    </div>
                    {product.isFeatured && (
                      <AdminStatusBadge status="featured">Featured</AdminStatusBadge>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {product.inStock} items left
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="No stock alerts"
              description="Low stock products will show up here automatically."
              icon={Warehouse}
            />
          )}
        </AdminPanel>

        <AdminPanel
          title="Recent tournaments"
          description="Latest event records from the tournament manager."
          className="xl:col-span-4"
        >
          {recentTournaments.length > 0 ? (
            <div className="space-y-3">
              {recentTournaments.map((tournament) => (
                <div
                  key={tournament._id}
                  className="rounded-md border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{tournament.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tournament.game} - {tournament.platform}
                      </p>
                    </div>
                    <AdminStatusBadge status={tournament.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(tournament.startDate)}</span>
                    <span>
                      {tournament.currentParticipants}/{tournament.maxParticipants}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="No tournaments yet"
              description="Create a tournament to start tracking event activity."
              icon={Trophy}
            />
          )}
        </AdminPanel>

        <AdminPanel
          title="Recent users"
          description="Latest user records added to the platform."
          className="xl:col-span-4"
        >
          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="rounded-md border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${getStatusClasses(
                        user.role,
                      )}`}
                    >
                      {user.role}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Added {formatDate(user.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="No recent users"
              description="New accounts will appear here when they are created."
              icon={Users}
            />
          )}
        </AdminPanel>
      </section>
    </AdminPage>
  );
}
