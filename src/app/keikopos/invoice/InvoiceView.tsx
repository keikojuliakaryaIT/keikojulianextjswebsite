"use client";

import KeikoInvoice from "./KeikoInvoice";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { PDFViewer } from "@react-pdf/renderer";
// import { PDFViewer } from "@react-pdf/renderer";

export default function InvoicePage() {
  const carts = useAppSelector((state) => state.cart?.items);
  const customer = useAppSelector((state) => state.cart?.customer);
  const company = useAppSelector((state) => state.cart?.companyPayment);
  const [isClient, setisClient] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setisClient(true);
  }, []);

  if (isClient) {
    return (
      <div>
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <KeikoInvoice carts={carts} customer={customer} company={company} />
        </PDFViewer>
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
