"use client";

import KeikoInvoice from "./KeikoInvoice";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import { useCallback, useEffect, useState } from "react";
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
  const [totalPrice, setTotalPrice] = useState(0);
  const [grandTotal, setgrandTotal] = useState(0);
  const [disabledSendMail, setDisabledSendMail] = useState(false);
  const countingPrice = useCallback(() => {
    let pricing = 0;
    if (carts && carts.length > 0) {
      carts?.forEach((element: any) => {
        pricing += element.stockOut * element.priceSG;
      });
    }
    setTotalPrice(pricing);
  }, [carts]);
  const grandTotals = useCallback(() => {
    let pricing = 0;
    if (carts && carts.length > 0) {
      carts?.forEach((element: any) => {
        pricing += element.stockOut * element.priceSG;
      });
    }
    pricing -= pricing * (Number(customer.discount) / 100);
    pricing += pricing * 0.09;
    setgrandTotal(pricing);
  }, [carts, customer.discount]);

  useEffect(() => {
    countingPrice();
    grandTotals();
    setisClient(true);
  }, [countingPrice, grandTotals]);

  async function sendMails() {
    setDisabledSendMail(true);
    const myPdf = pdf();
    myPdf.updateContainer(
      <KeikoInvoice
        carts={carts}
        customer={customer}
        company={company}
        totalPrice={totalPrice}
        grandTotal={grandTotal}
      />
    );
    const blob = await myPdf.toBlob();
    const pdfBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is a Base64 string prefixed with "data:application/pdf;base64,"
        const result = reader.result as string; // Type assertion
        const base64String = result.split(",")[1]; // Get the Base64 part
        resolve(base64String);
      };
      reader.onerror = reject; // Handle any errors
      reader.readAsDataURL(blob); // Read the Blob as a data URL
    });
    try {
      await axios.post("/api/sendMail", {
        name: customer?.name,
        email: customer?.email,
        message: "Invoice",
        attachment: {
          name: `${customer.invoice}.pdf`, // Name of the attachment
          data: pdfBase64, // Content of the attachment (Base64 or Buffer)
          type: "application/pdf",
        },
      });
      toast.success("Send Email Successfull. Check  your email for invoice.", {
        important: true,
        duration: 2000,
      });
      setDisabledSendMail(false);
    } catch (error) {
      console.log("error ", error);
      toast.error("Failed to send mail. Please check data or try again.");
      setDisabledSendMail(false);
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
          <KeikoInvoice
            carts={carts}
            customer={customer}
            company={company}
            totalPrice={totalPrice}
            grandTotal={grandTotal}
          />
        </PDFViewer>
        <PDFDownloadLink
          document={
            <KeikoInvoice
              carts={carts}
              customer={customer}
              company={company}
              totalPrice={totalPrice}
              grandTotal={grandTotal}
            />
          }
          fileName={`${customer?.invoice}.pdf`}
          onLoad={(loading) => {
            loading ? "Generating PDF..." : "Generate PDF";
          }}
        >
          <button className="p-5 border-2 rounded-md ml-20 bg-green-500 text-white font-bold">
            Download PDF
          </button>
        </PDFDownloadLink>
        <button
          className={`p-5 border-2 rounded-md ml-20 ${
            disabledSendMail
              ? "bg-gray-500 text-white"
              : "bg-red-500 text-white"
          }  font-bold`}
          onClick={sendMails}
          disabled={disabledSendMail}
        >
          Send Mail
        </button>
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
