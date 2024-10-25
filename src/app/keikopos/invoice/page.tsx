"use client";
import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/components/lib/hooks";
import getData from "@/components/firebase/getData";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
// import InvoicePage from "./InvoiceView";
const InvoiceView = dynamic(() => import("./InvoiceView"), {
  ssr: false,
});

export default function Home() {
  const [isClient, setisClient] = useState(false);
  const company = useAppSelector((state) => state.cart?.companyPayment);
  const searchParams = useSearchParams();
  const [resultOrder, setresultOrder] = useState<any>();
  const getDataOrders = useCallback(async () => {
    try {
      const { result, error } = await getData(
        `Sale/POS/Orders`,
        searchParams.get("id") ?? ""
      );

      if (!error) {
        setresultOrder(result);
        setisClient(true);
      } else {
        return toast("ERROR, Please Try Again !");
      }
    } catch (error) {
      console.log("error getlocal ", error);
    }
  }, [searchParams]);

  useEffect(() => {
    getDataOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (isClient) {
    return (
      <div>
        <InvoiceView
          carts={resultOrder?.carts}
          customer={resultOrder?.customer}
          company={company}
        />
      </div>
    );
  } else {
    return <div>Home</div>;
  }
}
