"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
// import InvoicePage from "./InvoiceView";
const InvoiceView = dynamic(() => import("./InvoiceView"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setisClient] = useState(false);
  const carts = useAppSelector((state) => state.cart?.items);
  const customer = useAppSelector((state) => state.cart?.customer);
  const company = useAppSelector((state) => state.cart?.companyPayment);
  useEffect(() => {
    setisClient(true);
  }, []);
  if (isClient) {
    return <InvoiceView carts={carts} customer={customer} company={company} />;
  } else {
    return <div>Home</div>;
  }
}
