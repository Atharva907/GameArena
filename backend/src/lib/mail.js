import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendMail(subject, receiver, html) {
  if (!env.mail.email || !env.mail.password || (!env.mail.host && !env.mail.service)) {
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
      user: env.mail.email,
      pass: env.mail.password,
    },
  };

  if (env.mail.service) {
    transporterConfig.service = env.mail.service;
  }

  if (env.mail.host) {
    transporterConfig.host = env.mail.host;
    transporterConfig.port = env.mail.port;
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  try {
    await transporter.sendMail({
      from: `"GameArena" <${env.mail.email}>`,
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
