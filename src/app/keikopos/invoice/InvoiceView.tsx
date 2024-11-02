"use client";

import KeikoInvoice from "./KeikoInvoice";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { pdf, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { sendMail } from "@/components/lib/features/mail/sendmail";
import { toast } from "sonner";
import axios from "axios";
import { promises as fs } from "fs";
// import { PDFViewer } from "@react-pdf/renderer";

export default function InvoicePage({
  carts,
  customer,
  company,
}: {
  carts: any;
  customer: any;
  company: any;
}) {
  const [isClient, setisClient] = useState(false);
  useEffect(() => {
    setisClient(true);
  }, [carts]);
  async function sendMails() {
    console.log(" send mail ");
    const myPdf = pdf();
    myPdf.updateContainer(
      <KeikoInvoice carts={carts} customer={customer} company={company} />
    );
    // const blob = await pdf(
    //   <KeikoInvoice carts={carts} customer={customer} company={company} />
    // ).toBlob();
    const blob = await myPdf.toBlob();
		const buiffer = await myPdf.toBuffer()
    const file = new File([blob], `${customer.invoice}.pdf`, {
      type: "application/pdf",
    });

    console.log(" send mail attach ", file);
		// fs.writeFile({dat})
    try {
      await axios.post("/api/sendMail", {
        name: "Keiko Julia",
        email: "admin@keikojulia.com",
        message: "Invoice",
        attachment: {
          name: `${customer.invoice}.pdf`, // Name of the attachment
          data: buiffer, // Content of the attachment (Base64 or Buffer)
          type: "application/pdf",
        },
      });
      toast.success("Message received. I will contact you as soon as I can.");
    } catch (error) {
      console.log("error ", error);
      toast.error("Failed to send message. Please try again.");
    }
    // const response = await sendMail({
    //   email: "admin@keikojulia.com",
    //   subject: `Invoice`,
    //   text: `Invoice`,
    //   sendTo: "aryadaulat@gmail.com",
    //   // attachments: [
    //   //   {
    //   //     filename: `${customer.invoice}.pdf`,
    //   //     content: file,
    //   //   },
    //   // ],
    // });
    // if (response?.messageId) {
    //   toast.success("Application Submitted Successfully.");
    // } else {
    // 	console.log('response ',response)
    //   toast.error("Failed To send application.");
    // }
  }

  if (isClient) {
    return (
      <div>
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <KeikoInvoice carts={carts} customer={customer} company={company} />
        </PDFViewer>
        <PDFDownloadLink
          document={
            <KeikoInvoice carts={carts} customer={customer} company={company} />
          }
          fileName={`${customer?.invoice}.pdf`}
        >
          <button className="p-5 border-2 rounded-md ml-20 bg-green-500 text-white font-bold">
            Download PDF
          </button>
        </PDFDownloadLink>
        {/* <button
          className="p-5 border-2 rounded-md ml-20 bg-red-500 text-white font-bold"
          onClick={sendMails}
        >
          Send Mail
        </button> */}
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
