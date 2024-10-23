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
  const [localCustomer, setlocalCustomer] = useState<any>();
  const [localCarts, setlocalCarts] = useState<any>([]);
  const getData = useCallback(() => {
    try {
      const valueCustomer = window.localStorage.getItem("customer");
      const valueCarts = window.localStorage.getItem("carts");
      if (valueCustomer) {
        console.log("value customer ", valueCustomer);
        setlocalCustomer(JSON.parse(valueCustomer));
      } else {
        console.log("failed local data Customer");
      }
      if (valueCarts) {
        console.log("value valueCarts ", valueCarts);
        setlocalCarts(JSON.parse(valueCarts));
      } else {
        console.log("failed local data Carts");
      }
    } catch (error) {
      console.log("error getlocal ", error);
    }
  }, []);

  useEffect(() => {
    setisClient(true);
    getData();
    console.log("carts page ", carts);
  }, [carts, getData]);
  if (isClient) {
    return (
      <InvoiceView
        carts={localCarts}
        customer={localCustomer}
        company={company}
      />
    );
  } else {
    return <div>Home</div>;
  }
}
