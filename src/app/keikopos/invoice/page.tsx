"use client";
import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import getData from "@/components/firebase/getData";
import { toast } from "sonner";
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
  const [resultOrder, setresultOrder] = useState<any>();
  const getDataOrders = useCallback(async () => {
    try {
      const { result, error } = await getData(
        `Sale/POS/Orders`,
        "xm18yIgwRGfVATF5b3h9"
      );

      if (!error) {
        console.log("result get ", result);
        setresultOrder(result);
        setisClient(true);
      } else {
        return toast("ERROR, Please Try Again !");
      }
    } catch (error) {
      console.log("error getlocal ", error);
    }
  }, []);

  useEffect(() => {
    getDataOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (isClient) {
    return (
      <InvoiceView
        carts={resultOrder?.carts}
        customer={resultOrder?.customer}
        company={company}
      />
    );
  } else {
    return <div>Home</div>;
  }
}
