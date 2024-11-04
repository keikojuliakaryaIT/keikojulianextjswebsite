import { NextResponse } from "next/server";
import nodemailer from "nodemailer";


export async function POST(request: Request) {
  try {
    const { name, email, message, attachment } = await request.json();
		const transporter = nodemailer.createTransport({
      service: "Hostinger",
      host: "smtp.hostinger.com",
      secure: true,
      port: 465, 
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
