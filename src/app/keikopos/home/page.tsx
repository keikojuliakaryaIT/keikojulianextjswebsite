"use client";
import createData from "@/components/firebase/createData";
import getDataCollection from "@/components/firebase/getDataCollection";
import updateData from "@/components/firebase/updateData";
import {
  addCart,
  changeCustomerData,
  changeStock,
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
  });
  const router = useRouter();

  const getDataProducts = useCallback(async () => {
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
    setOnRefresh(false);
  }, []);
  useEffect(() => {
    setOnRefresh(true);
    getDataProducts();
  }, [getDataProducts]);
  // useEffect(() => {
  //   console.log("carts ", carts);
  // }, [carts]);

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
    } else {
      dispatch(changeStock({ index, value }));
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
  async function createOrder(item: any) {
    console.log("item ", item);
  }

  async function createInvoice() {
    // window.localStorage.setItem("customer", JSON.stringify(customer));
    // window.localStorage.setItem("carts", JSON.stringify(carts));
    // dispatch(changeCustomerData(customer));
    const data = {
      location: "testingEvent",
      customer: customer,
      carts: carts,
    };
    // const { result, error } = await createData(`Sale/POS/Orders`, data);
    const { result, error } = await updateData(
      `Sale/POS/Orders`,
      "xm18yIgwRGfVATF5b3h9",
      data
    );
    if (!error) {
      toast.success("Add Product successful!");
      console.log("result add Order ", result?.id);
			return router.push("invoice?id=xm18yIgwRGfVATF5b3h9");
      // setProduct((prev) => {
      //   return { ...prev, idProduct: "" };
      // });
    }
    // return router.push("invoice");
  }

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
                        autoFocus
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
                        autoFocus
                        label="Adress Customer"
                        labelPlacement="outside"
                        type="text"
                        variant="bordered"
                        value={customer.address}
                        inputMode="email"
                        onValueChange={(datas) =>
                          setCustomer((prev) => {
                            return { ...prev, address: datas };
                          })
                        }
                      />
                      <h2>List Items</h2>
                      <div className="p-2 border-1 rounded-sm">
                        {carts?.map((data) => (
                          <div key={data.id} className="flex justify-between">
                            <div>
                              <p>{data.nameProduct}</p>
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
                    <Button color="danger" onPress={() => createOrder(carts)}>
                      Create Order
                    </Button>
                    <Button color="secondary" onPress={createInvoice}>
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
        {items?.map((data: any) => (
          <div
            className="flex flex-row justify-between my-5 border-1 p-2 rounded-md"
            key={data.id}
          >
            <div>
              <p>{data.nameProduct !== "" ? data.nameProduct : "Not Set"}</p>
              <p>{data.idProduct}</p>
              <p>Stock : {data.stock_sg ?? 0}</p>
            </div>
            <div className="flex flex-row gap-2 justify-center items-center">
              <Button
                color="primary"
                aria-label="Plus"
                isDisabled={data?.stock_sg === 0 || data.stock_sg === undefined}
                onPress={() => addToCart(data)}
              >
                <FaPlus /> <p>Add To Cart</p>
              </Button>
            </div>
          </div>
        ))}
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
          })}
        </div>
        <div>
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
