import { Suspense } from "react";
import OrdersList from "./OrdersList";
import {
  AdminHeader,
  AdminPage,
  AdminPanel,
} from "@/components/Application/Admin/AdminUi";

export default function OrdersPage() {
  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Orders"
        title="Run order operations without noisy screens"
        description="Review totals, update fulfillment status, and drill into order details from a cleaner responsive workspace."
        chips={["Orders", "Fulfillment", "Revenue tracking"]}
      />

      <Suspense
        fallback={
          <AdminPanel title="Order feed">
            <div className="py-12 text-sm text-muted-foreground">Loading orders...</div>
          </AdminPanel>
        }
      >
        <OrdersList />
      </Suspense>
    </AdminPage>
  );
}
