"use client";
import createData from "@/components/firebase/createData";
import getDataCollection from "@/components/firebase/getDataCollection";
import updateData from "@/components/firebase/updateData";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { platform } from "os";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";

type productItem = {
  id?: string;
  idProduct: string;
  nameProduct: string;
  type: string;
  stock: number;
  description: string;
  notes: string;
  image: string;
  status: "Available" | "Not Available" | "Out Of Stock";
  nomor?: string;
}[];
export default function Operational() {
  const [onRefresh, setOnRefresh] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [type, setType] = useState<[{ id: string; type: string }]>();
  const [defaultProducs, setDefaultProducs] = useState<productItem>();
  const [selectedProduct, setselectedProduct] = useState<any>();
  const [stockProduct, setStockProduct] = useState(0);
  const [product, setProduct] = useState<{
    id: string;
    idProduct: string;
    nameProduct: string;
    type: string;
    stock: number;
    description: string;
    notes: string;
    image: string;
    notesStocker: string;
  }>({
    id: "",
    idProduct: "",
    nameProduct: "",
    type: "",
    stock: 0,
    description: "",
    notes: "",
    image: "",
    notesStocker: "",
  });

  async function pushDataStock() {
    let findData = defaultProducs?.find((data) => {
      return data.id === selectedProduct;
    });
    if (findData) {
      const { result, error } = await createData(`Inventory/Storage/StockIn`, {
        idProduct: findData?.idProduct,
        nameProduct: findData?.nameProduct,
        platform: "",
        stockProduct,
      });
      if (!error) {
        delete findData.id;
        delete findData.nomor;
        findData.stock += stockProduct;
        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          selectedProduct,
          findData
        );
        if (!error) {
          setselectedProduct(undefined);
          setStockProduct(0);
          console.log("result update Data berhasil");
        }
      } else {
        console.log("error add data stock ", error);
      }
    } else {
      console.log("No Data");
    }
  }
  async function pushDataStockOut() {
    let findData = defaultProducs?.find((data) => {
      return data.id === selectedProduct;
    });
    if (findData) {
      const { result, error } = await createData(`Inventory/Storage/StockOut`, {
        idProduct: findData?.idProduct,
        nameProduct: findData?.nameProduct,
        platform: "",
        stockProduct,
      });
      if (!error) {
        delete findData.id;
        delete findData.nomor;
        findData.stock -= stockProduct;
        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          selectedProduct,
          findData
        );
        if (!error) {
          console.log("result update Data berhasil");
          setselectedProduct(undefined);
          setStockProduct(0);
        }
      } else {
        console.log("error add data stock ", error);
      }
    } else {
      console.log("No Data");
    }
  }
  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedProduct(e.target.value);
  };

  function renderModal() {
    if (modal === "detail") {
      return (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            classNames={{ base: "light text-black" }}
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Detail Pasien
                  </ModalHeader>
                  <ModalBody>
                    <p>nama</p>
                    <p>gender</p>
                    <p>nik</p>
                    <p>pekerjaan</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={onClose}
                      className="bg-greenbt text-white"
                    >
                      Tutup
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "delete") {
      return (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            classNames={{ base: "light text-black" }}
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Delete Pasien
                  </ModalHeader>
                  <ModalBody>
                    <p>Apakah Kamu Yakin Menghapus Data {}</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={onClose}
                      className="bg-bluebt text-white"
                    >
                      Batal
                    </Button>
                    <Button
                      variant="solid"
                      // onPress={}
                      className="bg-red-600 text-white"
                    >
                      Hapus
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "StockIn") {
      return (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            className="w-100v"
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Add Stock Product
                  </ModalHeader>
                  <ModalBody>
                    <Select
                      required={true}
                      items={defaultProducs}
                      label="Choose Product"
                      placeholder="Select an Type"
                      selectedKeys={[selectedProduct]}
                      onChange={handleSelectionChange}
                    >
                      {(product) => (
                        <SelectItem key={product?.id || product.idProduct}>
                          {`(${product.idProduct}) - ${product?.nameProduct}`}
                        </SelectItem>
                      )}
                    </Select>
                    <Input
                      required={true}
                      autoFocus
                      className="w-80v max-w-full"
                      classNames={{
                        innerWrapper: "w-[100%]",
                        inputWrapper: "w-[100%]",
                      }}
                      label="Quantity Product"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={stockProduct.toString()}
                      onValueChange={(data) => setStockProduct(Number(data))}
                    />
                    {/* <Input
											label="Tanggal Lahir"
											labelPlacement='outside'
											type="text"
											inputMode='text'
											variant="bordered"
											value={lahir}
											onValueChange={setlahir}
										/> */}
                    {/* <Select
                      classNames={{ base: "light" }}
                      label="Jenis Kelamin"
                      placeholder="Pilih Jenis Kelamin"
                      className="mt-5 bg-gray-100"
                      selectedKeys={[kelamin]}
                      onChange={handleSelectionChange}
                    >
                      <SelectItem
                        key={"pria"}
                        value={"Pria"}
                        classNames={{ base: "light" }}
                        className="text-white"
                      >
                        Pria
                      </SelectItem>
                      <SelectItem
                        key={"wanita"}
                        value={"Perempuan"}
                        classNames={{ base: "light" }}
                        className="text-white"
                      >
                        Perempuan
                      </SelectItem>
                    </Select> */}
                  </ModalBody>
                  <ModalFooter>
                    {/* <Button
                      variant="flat"
                      onPress={simpanDataPasienBaru}
                      className="bg-bluebt text-white"
                    >
                      Simpan
                    </Button> */}
                    <Button
                      variant="flat"
                      onPress={pushDataStock}
											size="lg"
                      isDisabled={
                        (!selectedProduct || selectedProduct === "") ||
                        stockProduct === 0
                      }
                      className="bg-greenbt text-white"
                    >
                      Add Stock Product
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "StockOut") {
      return (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Stock Out Product
                  </ModalHeader>
                  <ModalBody>
                    <Select
                      required={true}
                      items={defaultProducs}
                      label="Choose Product"
                      placeholder="Select an Type"
                      selectedKeys={[selectedProduct]}
                      onChange={handleSelectionChange}
                    >
                      {(product) => (
                        <SelectItem key={product?.id || product.idProduct}>
                          {`(${product.idProduct}) - ${product?.nameProduct}`}
                        </SelectItem>
                      )}
                    </Select>
                    <Input
                      required={true}
                      autoFocus
                      label="Quantity Product"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={stockProduct.toString()}
                      onValueChange={(data) => setStockProduct(Number(data))}
                    />
                    {/* <Input
											label="Tanggal Lahir"
											labelPlacement='outside'
											type="text"
											inputMode='text'
											variant="bordered"
											value={lahir}
											onValueChange={setlahir}
										/> */}
                    {/* <Select
                      classNames={{ base: "light" }}
                      label="Jenis Kelamin"
                      placeholder="Pilih Jenis Kelamin"
                      className="mt-5 bg-gray-100"
                      selectedKeys={[kelamin]}
                      onChange={handleSelectionChange}
                    >
                      <SelectItem
                        key={"pria"}
                        value={"Pria"}
                        classNames={{ base: "light" }}
                        className="text-white"
                      >
                        Pria
                      </SelectItem>
                      <SelectItem
                        key={"wanita"}
                        value={"Perempuan"}
                        classNames={{ base: "light" }}
                        className="text-white"
                      >
                        Perempuan
                      </SelectItem>
                    </Select> */}
                  </ModalBody>
                  <ModalFooter>
                    {/* <Button
                      variant="flat"
                      onPress={simpanDataPasienBaru}
                      className="bg-bluebt text-white"
                    >
                      Simpan
                    </Button> */}
                    <Button
                      variant="flat"
                      isDisabled={
                        (!selectedProduct || selectedProduct === "") ||
                        stockProduct === 0
                      }
											size="lg"
                      onPress={pushDataStockOut}
                      className="bg-greenbt text-white"
                    >
                      Add Stock Out Product
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    }
  }
  const openStockInModal = useCallback(() => {
    setModalRender("StockIn");
    onOpen();
  }, [onOpen]);

  const openStockOutModal = useCallback(() => {
    setModalRender("StockOut");
    onOpen();
  }, [onOpen]);
  const getDataType = useCallback(async () => {
    const { result, error } = await getDataCollection(`Inventory/Admin/Type`);
    if (!error) {
      setType(result);
    } else {
      return toast("ERROR, Please Try Again !");
    }
  }, []);

  const getDataProducts = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/Products`
    );

    if (!error) {
      setDefaultProducs(result);
    } else {
      return toast("ERROR, Please Try Again !");
    }
    setOnRefresh(false);
  }, []);

  useEffect(() => {
    setOnRefresh(true);
    getDataType();
    getDataProducts();
  }, [getDataProducts, getDataType]);

  return (
    <div className="flex flex-col p-5">
      {renderModal()}
      <div>Operational</div>
      <div className="flex flex-row justify-between">
        <div>Add Stock Product</div>
        <div>
          <Button onPress={openStockInModal}>Add More</Button>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <div>Stock Out Product</div>
        <div>
          <Button onPress={openStockOutModal}>Stock Out</Button>
        </div>
      </div>
    </div>
  );
}
