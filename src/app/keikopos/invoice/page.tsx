"use client";
import React, { useCallback, useEffect, useState } from "react";
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
  const [localCustomer, setlocalCustomer] = useState<any>(
    JSON.parse(window.localStorage.getItem("customer") ?? "")
  );
  const [localCarts, setlocalCarts] = useState<any>(
    JSON.parse(window.localStorage.getItem("carts") ?? `[]`)
  );
  const getData = useCallback(() => {
    try {
      let valueCustomer = window.localStorage.getItem("customer");
      let valueCarts = window.localStorage.getItem("carts");
      if (valueCustomer) {
        console.log("value customer invoice ", valueCustomer);
        setlocalCustomer(JSON.parse(valueCustomer));
        if (valueCarts) {
          console.log("value valueCarts invoice ", valueCarts);
          setlocalCarts(JSON.parse(valueCarts));
          setisClient(true);
        } else {
          console.log("failed local data Invoice Page Carts");
        }
      } else {
        console.log("failed local data Customer");
      }
    } catch (error) {
      console.log("error getlocal ", error);
    }
  }, []);

  useEffect(() => {
    getData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (isClient) {
    return (
      <InvoiceView
        carts={carts}
        customer={customer}
        company={company}
      />
    );
  } else {
    return <div>Home</div>;
  }
}
