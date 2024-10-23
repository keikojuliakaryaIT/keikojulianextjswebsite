import html2canvas from "html2canvas";
import React, { useEffect, useState, useCallback, useRef } from "react";
import jsPDF from "jspdf";
const KeikoInvoice = ({
  carts,
  customer,
  company,
}: {
  carts: any;
  customer: any;
  company: any;
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const pdfRef = useRef(null);

  const countingPrice = useCallback(() => {
    let pricing = 0;
    carts?.forEach((element: any) => {
      pricing += element.stockOut * element.priceSG;
    });
    setTotalPrice(pricing);
  }, [carts]);

  useEffect(() => {
    countingPrice();
  }, [countingPrice]);

  function convertCurrency(price: any) {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    }).format(price);
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "a4",
  });
  async function generatedPDF() {
    const invoice = pdfRef.current;
    try {
      if (invoice) {
        const canvas = await html2canvas(invoice);
        const imgData = canvas.toDataURL("image/png");
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`${customer.name}.pdf`);
      }
    } catch (error) {
      console.log("error ", error);
    }
  }

  return (
    <div>
      <button onClick={() => generatedPDF()}>Generated PDF</button>
      <div className="p-8 bg-white" ref={pdfRef}>
        <div className="flex justify-end mb-5">
          <img src="/logoResize.png" alt="Logo" width={"50%"} />
        </div>
        <h1 className="text-4xl text-right text-black mb-5">INVOICE</h1>

        <div className="flex justify-between mb-8">
          <div>
            <h2 className="font-semibold">ISSUED TO:</h2>
            <p>{customer.name}</p>
            <p>{customer.email}</p>
            {customer.address && <p>{customer.address}</p>}
          </div>
          <div>
            <p>Invoice NO: 102501</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h2 className="font-semibold">PAY TO:</h2>
            <p>{company.name}</p>
            <p>Account No: {company.accountNo}</p>
            <p>{company.address}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex border-b pb-2 mb-2 justify-between">
            <div className="w-[60%] font-semibold">Description</div>
            <div className="w-[20%] text-center font-semibold">Unit Price</div>
            <div className="w-[10%] text-center font-semibold">QTY</div>
            <div className="w-[10%] text-right font-semibold">TOTAL</div>
          </div>
          {carts?.map((data: any) => (
            <div className="flex py-2  justify-between" key={data.id}>
              <div className="w-[60%]">{data.nameProduct}</div>
              <div className="w-[20%] text-center">
                {convertCurrency(data.priceSG)}
              </div>
              <div className="w-[10%] text-center">{data.stockOut}</div>
              <div className="w-[10%] text-right">
                {convertCurrency(Number(data.priceSG) * Number(data.stockOut))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t pt-4">
          <div>Sub Total</div>
          <div>{convertCurrency(totalPrice)}</div>
        </div>
        <div className="flex justify-between">
          <div>Tax 9%</div>
          <div>{convertCurrency(totalPrice * 0.09)}</div>
        </div>
        <div className="flex justify-between font-bold">
          <div>Total</div>
          <div>{convertCurrency(totalPrice * 0.09 + totalPrice)}</div>
        </div>
      </div>
    </div>
  );
};

export default KeikoInvoice;
