import { sendMail } from "./mail.js";
import { orderConfirmationEmail, orderStatusEmail } from "../templates/orderEmails.js";

export async function sendOrderConfirmation(order) {
  const receiver = order.player?.email;
  if (!receiver) return;
  const result = await sendMail(
    `GameArena order confirmed: ${order.orderNumber || order._id}`,
    receiver,
    orderConfirmationEmail(order),
  );
  if (!result.success) console.warn("Order confirmation email failed:", result.message);
}

export async function sendOrderStatusNotification(order) {
  const receiver = order.player?.email;
  if (!receiver) return;
  const result = await sendMail(
    `GameArena order ${order.status}: ${order.orderNumber || order._id}`,
    receiver,
    orderStatusEmail(order),
  );
  if (!result.success) console.warn("Order status email failed:", result.message);
}
