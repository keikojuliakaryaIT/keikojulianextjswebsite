"use client";
import { useAppSelector } from "@/components/lib/hooks";
import React from "react";
import KeikoInvoice from "./KeikoInvoiceHTML";

export default function Invoice() {
  const carts = useAppSelector((state) => state.cart?.items);
  const customer = useAppSelector((state) => state.cart?.customer);
  const company = useAppSelector((state) => state.cart?.companyPayment);
  return (
    <div>
      <KeikoInvoice carts={carts} customer={customer} company={company} />
    </div>
  );
}
