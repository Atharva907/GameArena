import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendMail(subject, receiver, html) {
  const email = String(env.mail.email || "").trim();
  const password = String(env.mail.password || "").replace(/\s+/g, "");
  const host = String(env.mail.host || "").trim();
  const service = String(env.mail.service || "").trim();

  if (!email || !password || (!host && !service)) {
    return {
      success: false,
      message: "Mail service is not configured.",
    };
  }

  const transporterConfig = {
    secure: env.mail.secure,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: email,
      pass: password,
    },
  };

  if (host) {
    transporterConfig.host = host;
    transporterConfig.port = env.mail.port;
  } else if (service) {
    transporterConfig.service = service;
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  try {
    await transporter.sendMail({
      from: `"GameArena" <${email}>`,
      to: receiver,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error(`Mail send failed for ${receiver}: ${error.message}`);
    return { success: false, message: error.message };
  }
}
