import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendMail(subject, receiver, html) {
  const transporterConfig = {
    secure: env.mail.secure,
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
    return { success: false, message: error.message };
  }
}
