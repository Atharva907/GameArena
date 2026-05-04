import { Suspense } from "react";
import OrderDetails from "./OrderDetails";
import {
  AdminBackLink,
  AdminHeader,
  AdminPage,
  AdminPanel,
} from "@/components/Application/Admin/AdminUi";

export default async function OrderPage({ params }) {
  const { id } = await params;

  return (
    <AdminPage className="mx-0 max-w-none">
      <AdminHeader
        eyebrow="Order Detail"
        title={`Review order #${String(id).slice(-8).toUpperCase()}`}
        description="Inspect payment, customer information, line items, and fulfillment status from one responsive detail view."
        chips={["Order detail", "Customer info", "Line items"]}
        actions={<AdminBackLink href="/admin/orders">Back to Orders</AdminBackLink>}
      />

      <Suspense
        fallback={
          <AdminPanel title="Order detail">
            <div className="py-12 text-sm text-muted-foreground">
              Loading order details...
            </div>
          </AdminPanel>
        }
      >
        <OrderDetails orderId={id} />
      </Suspense>
    </AdminPage>
  );
}
