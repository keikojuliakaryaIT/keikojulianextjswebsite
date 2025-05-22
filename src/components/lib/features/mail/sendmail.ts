"use server";
import nodemailer from "nodemailer";
const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST;
const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME;
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD;
const transporter = nodemailer.createTransport({
  host: SMTP_SERVER_HOST,
  secure: true,
  port: 465,
  auth: {
    user: SMTP_SERVER_USERNAME,
    pass: SMTP_SERVER_PASSWORD,
  },
});

export async function sendMail({
  email,
  sendTo,
  subject,
  text,
  html,
  attachments,
}: {
  email: string;
  sendTo?: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}) {
  try {
		console.log("check verify");
    const isVerified = await transporter.verify();
  } catch (error) {
    console.log(
      "Something Went Wrong",
      SMTP_SERVER_USERNAME,
      SMTP_SERVER_PASSWORD,
      error
    );
		console.log("check verify failed");
    return;
  }
  console.log("send info");
  const info = await transporter.sendMail({
    from: email,
    to: sendTo,
    subject: subject,
    text: text,
    // html: html ? html : "",
    // attachments: attachments,
  });
  console.log("Message Sent", info.messageId);
  console.log("Mail sent to", sendTo);
  return info;
}
