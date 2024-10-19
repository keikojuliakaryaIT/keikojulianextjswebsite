"use client";
import getDataCollection from "@/components/firebase/getDataCollection";
import { addCart, changeStock } from "@/components/lib/features/cart/slice";
import { useAppDispatch, useAppSelector } from "@/components/lib/hooks";
import { Button, Input, Pagination } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
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

  const getDataProducts = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/Products`
    );

    if (!error) {
      setDefaultProduct(result);
      setShowProduct(result);
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

  return (
    <div className="flex w-full px-5">
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
                <div className="flex flex-row gap-2 justify-center items-center">
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
          <Button fullWidth radius="sm" color="primary">
            Continue Too Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
