"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
// import InvoicePage from "./InvoiceView";
const InvoiceView = dynamic(() => import("./InvoiceView"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setisClient] = useState(false);
  useEffect(() => {
    setisClient(true);
  }, []);
  if (isClient) {
    return <InvoiceView />;
  } else {
    return <div>Home</div>;
  }
}
