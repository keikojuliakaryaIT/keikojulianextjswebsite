"use client";

import KeikoInvoice from "./KeikoInvoice";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
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
          <button className="p-5 border-2 rounded-md ml-20 bg-green-500 text-white font-bold">Download PDF</button>
        </PDFDownloadLink>
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
