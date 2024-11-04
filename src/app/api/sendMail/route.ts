import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME;
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD;
const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST;

export async function POST(request: Request) {
  try {
    const { name, email, message, attachment } = await request.json();
    console.log(
      "username ",
      SMTP_SERVER_USERNAME,
      " password ",
      SMTP_SERVER_PASSWORD
    );
    // const transporter = nodemailer.createTransport({
    //   host: SMTP_SERVER_HOST,
    //   secure: false,
    //   // secureConnection: false,
    //   port: 587,
    //   debug: true,
    //   connectionTimeout: 10000,
    //   auth: {
    //     user: SMTP_SERVER_USERNAME,
    //     pass: SMTP_SERVER_PASSWORD,
    //   },
    // });
    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   host: "smtp.gmail.com",
    //   secure: true,
    //   port: 465, // atau 587 secure: true, // atau false jika menggunakan port 587
    //   debug: true,
    //   auth: { user: "aryadaulat@gmail.com", pass: "qany svws vnmf pdkg" },
    // });
		const transporter = nodemailer.createTransport({
      service: "Hostinger",
      host: "smtp.hostinger.com",
      secure: true,
      port: 465, // atau 587 secure: true, // atau false jika menggunakan port 587
      debug: true,
      auth: { user: "admin@keikojulia.com", pass: "^+v4[EBTJYs1" },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    const mailOptions = {
      from: "admin@keikojulia.com",
      to: email,
      subject: "Keiko Julia Invoice",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      attachments: [
        {
          filename: attachment.name, // Name of the attachment
          content: attachment.data, // Content of the attachment (Base64 or Buffer)
          encoding: 'base64',
					contentType: attachment.type, // MIME type of the attachment (e.g., 'application/pdf', 'image/jpeg')
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `${error}` },
      {
        status: 500,
      }
    );
  }
}
