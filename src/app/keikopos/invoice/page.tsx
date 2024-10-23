"use client";

import KeikoInvoice from "./KeikoInvoice";
import dynamic from "next/dynamic";
import ReactPDF from "@react-pdf/renderer";
import { useAppSelector } from "@/components/lib/hooks";
import { useEffect } from "react";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

export default function InvoicePage() {
  const carts = useAppSelector((state) => state.cart?.items);
  const customer = useAppSelector((state) => state.cart?.customer);
  const company = useAppSelector((state) => state.cart?.companyPayment);
  useEffect(() => {
    console.log("carts invoice ", carts);
  }, [carts]);

  return (
    <PDFViewer style={{ width: "100%", height: "90vh" }}>
      <KeikoInvoice carts={carts} customer={customer} company={company}/>
    </PDFViewer>
    // <div className='h-90v'>

    // </div>
  );
}
