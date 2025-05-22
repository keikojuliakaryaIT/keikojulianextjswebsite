"use client";
import createData from "@/components/firebase/createData";
import getData from "@/components/firebase/getData";
import getDataCollection from "@/components/firebase/getDataCollection";
import updateData from "@/components/firebase/updateData";
import {
  addCart,
  changeCustomerData,
  changeStock,
  clearCart,
  deleteStock,
} from "@/components/lib/features/cart/slice";
import { useAppDispatch, useAppSelector } from "@/components/lib/hooks";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "sonner";

export default function HomePos() {
  const [defaultProduct, setDefaultProduct] = useState<any>();
  const [showProduct, setShowProduct] = useState<any>();
  const [onRefresh, setOnRefresh] = useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const pages = Math.ceil(showProduct?.length / rowsPerPage);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const carts = useAppSelector((state) => state.cart.items);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modalMode, setmodalMode] = useState<"delete" | "create">("delete");
  const [selectedItem, setselectedItem] = useState<any>();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
    staffPayment: "",
    codeSale: "",
    discount: "0",
  });
  const router = useRouter();
  const [settings, setSettings] = useState<any>();
  const [update, setUpdate] = useState(false);

  const getDataProducts = useCallback(async () => {
    // 4zvL76bmXRCo44WSSfIl
    const { result, error } = await getDataCollection(
      `Inventory/Storage/Products`
    );

    if (!error) {
      let sortingData = result.sort(
        (data1: any, data2: any) => data2.stock_sg - data1.stock_sg
      );
      setDefaultProduct(sortingData);
      setShowProduct(sortingData);
    } else {
      return toast("ERROR, Please Try Again !");
    }
  }, []);
  const getPOSSettings = useCallback(async () => {
    // 4zvL76bmXRCo44WSSfIl
    const { result, error } = await getData(
      `Sale/POS/Settings`,
      "4zvL76bmXRCo44WSSfIl"
    );

    if (!error) {
      setSettings(result);
    } else {
      return toast("ERROR, Please Try Again !");
    }
    setOnRefresh(false);
  }, []);
  useEffect(() => {
    setOnRefresh(true);
    getDataProducts();
    getPOSSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return showProduct?.slice(start, end);
  }, [page, rowsPerPage, showProduct]);

  useMemo(() => {
    if (search === "") {
      setShowProduct(defaultProduct);
    } else {
      setShowProduct(
        defaultProduct?.filter((item: any) => {
          return item.idProduct.toLowerCase().includes(search.toLowerCase());
        })
      );
    }
  }, [defaultProduct, search]);

  async function addToCart(item: any) {
    if (carts.find((data) => data.idProduct === item.idProduct)) {
      return toast.error("Product Already in Cart", {
        duration: 1000,
      });
    } else {
      let product = { ...item };
      product.stockOut = 1;
      dispatch(addCart(product));
    }
  }

  function onChangeStock(data: any, value: string, index: number) {
    if (data.stock_sg < Number(value)) {
      toast.error("Stock is not enough", {
        duration: 1000,
      });
    } else if (Number(value) <= 0) {
      toast.error("Number Is Minus", {
        duration: 1000,
      });
    } else {
      dispatch(changeStock({ index, value }));
      // setUpdate(true);
    }
  }
  function alertDelete(data: any) {
    setselectedItem(data);
    setmodalMode("delete");
    onOpen();
  }
  function openCreate(data: any) {
    // setselectedItem(data);
    setmodalMode("create");
    onOpen();
  }
  function onDeleteStock(data: any) {
    dispatch(deleteStock(data));
    onClose();
    toast.success("Delete Product Success", {
      duration: 1000,
    });
  }

  async function pushDataStockOut(item: any,saleDates:any) {
    let findData = { ...item };
    let productId = item.id;
    if (findData) {
      const { result, error } = await createData(`Inventory/Storage/StockOut`, {
        location: "Singapore",
        category: item?.type ?? "",
        idProduct: findData?.idProduct,
        nameProduct: findData?.nameProduct,
        platform: `Event-${customer.codeSale}`,
        stockProduct: Number(findData?.stockOut),
        PIC: customer.staffPayment,
        OrderData: saleDates,
        ArrivalData: saleDates,
        price: Number(findData.priceSG),
        note: "",
      });
      if (!error) {
        delete findData.id;
        delete findData.nomor;
        if (findData.stock_sg !== undefined) {
          findData.stock_sg -= findData.stockOut;
        } else {
          findData.stock_sg = -findData.stockOut;
        }

        delete findData.stockOut;

        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          productId,
          findData
        );
        if (!error) {
          toast.success("Add Stock Out Succesful");
        }
      } else {
        console.log("error add data stock ", error);
      }
    } else {
      console.log("No Data");
    }
  }

  async function createInvoice() {
    // window.localStorage.setItem("customer", JSON.stringify(customer));
    // window.localStorage.setItem("carts", JSON.stringify(carts));
    // dispatch(changeCustomerData(customer));
		let saleDates= 1729849825790;
    const data = {
      location: "testingEvent",
      customer: {
        ...customer,
        invoice: `51${customer.codeSale}${settings.InvoiceNumber.toString()}`,
        saleDate: saleDates,
      },
      carts: carts,
    };
		
    const { result, error } = await createData(`Sale/POS/Orders`, data);
    if (!error) {
      toast.success("Add Product successful!");
      let resultid = result?.id;
      try {
        carts?.map((data) => {
          pushDataStockOut(data,saleDates);
        });
        getDataProducts();
        const { result, error } = await updateData(
          `Sale/POS/Settings`,
          "4zvL76bmXRCo44WSSfIl",
          { InvoiceNumber: settings.InvoiceNumber + 1 }
        );
        if (!error) {
          toast.success("Add Stock Out Succesful");
        }
        dispatch(clearCart());
        setCustomer({
          address: "",
          email: "",
          name: "",
          codeSale: customer.codeSale,
          staffPayment: customer.staffPayment,
          discount: "",
        });
        return router.push(`invoice?id=${resultid}`);
      } catch (error) {
        console.log("error Data update stockout", error);
      }
      // setProduct((prev) => {
      //   return { ...prev, idProduct: "" };
      // });
    }
    // return router.push("invoice");
  }

  const checkFieldCreate = useCallback(() => {
    let check = true;
    if (
      customer.codeSale !== "" &&
      customer.email !== "" &&
      customer.name !== "" &&
      customer.staffPayment !== ""
    ) {
      check = false;
    }
    return check;
  }, [customer]);
  function convertCurrency(price: number) {
    let SGDollar = new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    });
    return SGDollar.format(price);
  }

  const subTotal = useMemo(() => {
    let total = 0;
    if (carts) {
      carts.forEach((item) => {
        total += Number(item.priceSG) * Number(item.stockOut);
      });
    }
    return total;
  }, [carts]);
  const taxPrice = useMemo(() => {
    // setUpdate(false);

    let discount = (Number(customer.discount) / 100) * subTotal;
    console.log("discount ", discount ,' sub total ',subTotal , ' total ', subTotal-discount);
    let tax = 0.09 * (subTotal - discount);
    return tax;
  }, [customer.discount, subTotal]);
  const grandTotal = useMemo(() => {
    let total = subTotal;
    // setUpdate(false);
    let discount = (Number(customer.discount) / 100) * subTotal;
    return total - discount + taxPrice;
  }, [customer.discount, subTotal, taxPrice]);
  return (
    <div className="flex w-full px-5">
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              {modalMode === "delete" ? (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Are You Sure?
                  </ModalHeader>
                  <ModalBody>
                    <p>
                      Delete {selectedItem?.idProduct}-
                      {selectedItem?.nameProduct} From cart?
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      color="danger"
                      onPress={() => onDeleteStock(selectedItem)}
                    >
                      Delete
                    </Button>
                  </ModalFooter>
                </>
              ) : modalMode === "create" ? (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Create Order
                  </ModalHeader>
                  <ModalBody>
                    <div>
                      <Input
                        isRequired
                        autoFocus
                        label="Name Customer"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.name}
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, name: datas };
                          })
                        }
                      />
                      <Input
                        isRequired
                        label="Email Customer"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.email}
                        inputMode="email"
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, email: datas };
                          })
                        }
                      />
                      <Textarea
                        label="Address"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.address}
                        inputMode="text"
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, address: datas };
                          })
                        }
                      />
                      <Input
                        isRequired
                        label="Code Event"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.codeSale}
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, codeSale: datas };
                          })
                        }
                      />
                      <Input
                        isRequired
                        label="Payment processed by"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.staffPayment}
                        inputMode="text"
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, staffPayment: datas };
                          })
                        }
                      />
                      <h2>List Items</h2>
                      <div className="p-2 border-1 rounded-sm">
                        {carts?.map((data) => (
                          <div key={data.id} className="flex justify-between">
                            <div>
                              <p>
                                {data.nameProduct !== "-"
                                  ? data.nameProduct
                                  : data.idProduct}
                              </p>
                            </div>
                            <div>
                              <p>{data.stockOut?.toString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    {/* <Button color="danger" onPress={() => createOrder(carts)}>
                      Create Order
                    </Button> */}
                    <Button
                      color="secondary"
                      onPress={createInvoice}
                      isDisabled={checkFieldCreate()}
                    >
                      Create Invoice
                    </Button>
                    {/* <Link href="/keikopos/invoice">
                      Create Invoice with link
                    </Link> */}
                  </ModalFooter>
                </>
              ) : null}
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="w-[60%]">
        <Input
          type="search"
          label="Search"
          value={search}
          onValueChange={setSearch}
          placeholder="Search code Product"
          labelPlacement="outside"
          startContent={<FaSearch />}
        />
        {items?.map((data: any) => {
          if (data.stock_sg !== undefined && data.stock_sg > 0) {
            return (
              <div
                className="flex flex-row justify-between my-5 border-1 p-2 rounded-md"
                key={data.id}
              >
                <div>
                  <p>
                    {data.nameProduct !== "" ? data.nameProduct : "Not Set"}
                  </p>
                  <p>{data.idProduct}</p>
                  <p>Stock : {data.stock_sg ?? 0}</p>
                  <p>Price : {convertCurrency(data.priceSG ?? 0)}</p>
                </div>
                <div className="flex flex-row gap-2 justify-center items-center">
                  <Button
                    color="primary"
                    aria-label="Plus"
                    isDisabled={
                      data?.stock_sg === 0 || data.stock_sg === undefined
                    }
                    onPress={() => addToCart(data)}
                  >
                    <FaPlus /> <p>Add To Cart</p>
                  </Button>
                </div>
              </div>
            );
          }
        })}
        <Pagination
          total={pages}
          // initialPage={1}
          isCompact
          // siblings={1}
          page={page}
          onChange={setPage}
        />
      </div>
      <div className="w-[39%] border-1 ml-[1%]">
        <h1 className="text-center py-2">Cart</h1>
        <div className="h-70v overflow-scroll">
          {carts?.map((data: any, index: number) => {
            if (data.stock_sg !== undefined && data.stock_sg > 0) {
              return (
                <div
                  className="flex flex-row justify-between my-5 border-1 p-2 rounded-md"
                  key={data.id}
                >
                  <div>
                    <p>
                      {data.nameProduct !== "" ? data.nameProduct : "Not Set"}
                    </p>
                    <p>{data.idProduct}</p>
                    <p>Stock : {data.stock_sg ?? 0}</p>
                    <p>Price : {convertCurrency(data.priceSG ?? 0)}</p>
                  </div>
                  <div className="flex flex-row gap-2 justify-center items-end gap-x-4">
                    <button onClick={() => alertDelete(data)}>
                      <MdDeleteForever className="text-center mb-1" size={24} />
                    </button>
                    <Input
                      type="number"
                      label="Quantity"
                      placeholder="0"
                      labelPlacement="outside"
                      value={data.stockOut?.toString()}
                      onValueChange={(item) => onChangeStock(data, item, index)}
                      // startContent={
                      //   <div className="pointer-events-none flex items-center">
                      //     <span className="text-default-400 text-small">$</span>
                      //   </div>
                      // }
                    />
                    {/* <Button
                  color="primary"
                  aria-label="Plus"
                  isDisabled={
                    data?.stock_sg === 0 || data.stock_sg === undefined
                  }
                  onPress={() => addToCart(data)}
                >
                  <FaPlus /> <p>Add To Cart</p>
                </Button> */}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="px-2">
          <div className="flex justify-between">
            <div>Sub Total Price : </div>
            <div>{convertCurrency(subTotal)}</div>
          </div>
          <div className="flex justify-between items-center">
            <div>Discount : </div>
            <div>
              <Input
                // isRequired
                // label="Discount"
                labelPlacement="outside-left"
                type="number"
                variant="bordered"
                value={customer.discount}
                onValueChange={(datas) =>
                  setCustomer((prev) => {
                    return { ...prev, discount: datas };
                  })
                }
              />
            </div>
          </div>

          {/* <div>Tax Price : {convertCurrency(taxPrice)}</div> */}
          <div className="flex justify-between">
            <div>Tax Price : </div>
            <div>{convertCurrency(taxPrice)}</div>
          </div>
          {/* <div>Total Price : {convertCurrency(grandTotal)}</div> */}
          <div className="flex justify-between">
            <div>Total Price : </div>
            <div>{convertCurrency(grandTotal)}</div>
          </div>
          <Button
            fullWidth
            radius="sm"
            color="primary"
            isDisabled={carts?.length === 0}
            onPress={openCreate}
          >
            Continue Too Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
