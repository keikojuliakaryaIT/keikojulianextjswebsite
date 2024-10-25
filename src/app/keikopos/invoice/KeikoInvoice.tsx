"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
// const Document = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.Document),
//   {
//     ssr: false,
//     loading: () => <p>Loading Document...</p>,
//   }
// );
// const Page = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.Page),
//   {
//     ssr: false,
//     loading: () => <p>Loading Page...</p>,
//   }
// );
// const Text = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.Text),
//   {
//     ssr: false,
//     loading: () => <p>Loading Text...</p>,
//   }
// );
// const View = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.View),
//   {
//     ssr: false,
//     loading: () => <p>Loading Document...</p>,
//   }
// );
// const Image = dynamic(
//   () => import("@react-pdf/renderer").then((mod) => mod.Image),
//   {
//     ssr: false,
//     loading: () => <p>Loading Font...</p>,
//   }
// );
// import OpenSansRegular from "@/../public/OpenSans/OpenSans-Regular.ttf";
// Create styles
Font.register({
  family: "OpenSansRegular",
  src: "/OpenSans/OpenSans-Regular.ttf",
});
const styles = StyleSheet.create({
  page: {
    flex: 1,
    // flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    alignItems: "center",
    height: 24,
    textAlign: "center",
  },
  description: {
    width: "60%",
  },
  qty: {
    width: "10%",
  },
  rate: {
    width: "15%",
  },
  amount: {
    width: "15%",
  },
  titleHeader: {
    // justifyContent:'flex-end',
    // alignItems: "flex-end",
  },
  titleHeaderText: {
    fontSize: 34,
    color: "gold",
    fontWeight: "bold",
    textAlign: "right",
  },
  titleHeaderTextInvoice: {
    fontSize: 34,
    color: "black",
    textAlign: "right",
    fontFamily: "OpenSansRegular",
    // textDecoration:'line-through',
  },
});

// Create Document Component
const KeikoInvoice = ({
  carts,
  customer,
  company,
}: {
  carts: any;
  customer: any;
  company: any;
}) => {
  // const carts = useAppSelector((state) => state.cart?.items);
  const [totalPrice, setTotalPrice] = useState(0);
  const countingPrice = useCallback(() => {
    let pricing = 0;
    if (carts && carts.length > 0) {
      carts?.forEach((element: any) => {
        pricing += element.stockOut * element.priceSG;
      });
    }
    setTotalPrice(pricing);
  }, [carts]);

  useEffect(() => {
    countingPrice();
  }, [countingPrice]);

  function convertCurrency(price: number) {
    let SGDollar = new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    });
    return SGDollar.format(price);
  }
  return (
    <Document pageMode="fullScreen">
      <Page size="A4" style={styles.page}>
        <View style={styles.titleHeader}>
          <View style={{ alignItems: "flex-end" }}>
            <Image
              src={"/logoResize.png"}
              style={{ width: "50%" }}
              // id="test"
              // alt="test"
            />
          </View>
          {/* <Text style={styles.titleHeaderText}>Keiko Julia</Text> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 20,
                left: 10,
                width: "70%",
                // height: 50,
                borderWidth: 1,
              }}
            />
            <Text style={styles.titleHeaderTextInvoice}>INVOICE</Text>
          </View>
        </View>
        <View
          style={{
            // flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 5,
            marginVertical: 20,
          }}
        >
          <View>
            <View style={{ paddingVertical: 20 }}>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                ISSUED TO :
              </Text>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                {customer.name}
              </Text>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                {customer.email}
              </Text>

              {customer.name !== "" ? (
                <Text
                  style={{
                    fontFamily: "OpenSansRegular",
                  }}
                >
                  {customer.address}
                </Text>
              ) : null}
            </View>
            <View>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                PAY To :
              </Text>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                {company.name}
              </Text>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                }}
              >
                Uen Number : {company.Uennumber}
              </Text>
              <Text
                style={{
                  fontFamily: "OpenSansRegular",
                  maxWidth: "50%",
                }}
              >
                {company.address}
              </Text>
            </View>
          </View>
          <View>
            <Text>Invoice NO : {customer.invoice}</Text>
            <Text>Date : {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={{}}>
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              paddingBottom: 5,
              paddingHorizontal: 5,
              marginBottom: 5,
            }}
          >
            <Text style={{ width: "55%", fontFamily: "OpenSansRegular" }}>
              Description
            </Text>
            <Text
              style={{
                width: "20%",
                textAlign: "center",
                fontFamily: "OpenSansRegular",
              }}
            >
              Unit Price
            </Text>
            <Text
              style={{
                width: "10%",
                textAlign: "center",
                fontFamily: "OpenSansRegular",
              }}
            >
              QTY
            </Text>
            <Text
              style={{
                width: "15%",
                textAlign: "right",
                fontFamily: "OpenSansRegular",
              }}
            >
              TOTAL
            </Text>
          </View>
          <View>
            {carts &&
              carts.length > 0 &&
              carts?.map((data: any) => {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      // borderBottomWidth: 1,
                      paddingBottom: 5,
                      paddingHorizontal: 5,
                    }}
                    key={data.id}
                  >
                    <Text
                      style={{ width: "55%", fontFamily: "OpenSansRegular" }}
                    >
                      {data.nameProduct}
                    </Text>
                    <Text
                      style={{
                        width: "20%",
                        textAlign: "center",
                        fontFamily: "OpenSansRegular",
                      }}
                    >
                      {convertCurrency(data.priceSG)}
                    </Text>
                    <Text
                      style={{
                        width: "10%",
                        textAlign: "center",
                        fontFamily: "OpenSansRegular",
                      }}
                    >
                      {data.stockOut}
                    </Text>
                    <Text
                      style={{
                        width: "15%",
                        textAlign: "right",
                        fontFamily: "OpenSansRegular",
                      }}
                    >
                      {convertCurrency(
                        Number(data.priceSG) * Number(data.stockOut)
                      )}
                    </Text>
                  </View>
                );
              })}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              paddingHorizontal: 5,
              marginTop: 10,
              paddingTop: 10,
            }}
          >
            <View>
              <Text>Sub Total</Text>
            </View>
            <View style={{ columnGap: 5, alignItems: "flex-end" }}>
              <Text
                style={{
                  width: 100,
                  textAlign: "right",
                  fontFamily: "OpenSansRegular",
                }}
              >
                {convertCurrency(totalPrice)}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text>Tax 9%</Text>
                <Text
                  style={{
                    width: 100,
                    textAlign: "right",
                    fontFamily: "OpenSansRegular",
                  }}
                >
                  {convertCurrency(totalPrice * 0.09)}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text>Total</Text>
                <Text
                  style={{
                    width: 100,
                    textAlign: "right",
                    fontFamily: "OpenSansRegular",
                  }}
                >
                  {convertCurrency(totalPrice * 0.09 + totalPrice)}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text>Payment Processed by : {customer.staffPayment}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default KeikoInvoice;
