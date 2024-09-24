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
  Textarea,
  useDisclosure,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { platform } from "os";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { today, getLocalTimeZone } from "@internationalized/date";
import { FaRegCalendarAlt } from "react-icons/fa";
import CurrencyInput from "react-currency-input-field";

type productItem = {
  id?: string;
  idProduct: string;
  nameProduct: string;
  type: string;
  stock: number;
  stock_id?: number;
  stock_sg?: number;
  description: string;
  notes: string;
  image: string;
  status: "Available" | "Not Available" | "Out Of Stock";
  nomor?: string;
}[];

const statusProduct = [
  {
    id: "Ordered",
    status: "Ordered",
  },
  {
    id: "Approved",
    status: "Approved",
  },
  {
    id: "On Delivery",
    status: "On Delivery",
  },
  {
    id: "Recieved",
    status: "Recieved",
  },
];

const baseLocation = [
  {
    id: "Singapore",
    location: "Singapore",
  },
  {
    id: "Indonesia",
    location: "Indonesia",
  },
];

export default function Operational() {
  const [onRefresh, setOnRefresh] = useState(false);
  const defaultDate = today("asia/singapore");
  const [orderDate, setOrderDate] = useState(defaultDate);
  const [arrivalDate, setArrivalDate] = useState(defaultDate);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [client, setClient] = useState<{ Client: string }[]>();
  const [category, setCategory] = useState<{ name: string }[]>();
  const [platform, setPlatform] = useState<{ name: string }[]>();
  const [staff, setStaff] = useState<
    {
      id: string | number;
      name: string;
    }[]
  >();
  const [defaultProducs, setDefaultProducs] = useState<productItem>();
  const [selectedProduct, setselectedProduct] = useState<any>();
  const [selectedClient, setselectedClient] = useState<any>();
  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [selectedStaff, setselectedStaff] = useState<any>();
  const [selectedStatus, setselectedStatus] = useState<any>();
  const [selectedPlatform, setSelectedPlatform] = useState<any>();
  const [selectedLocation, setSelectedLocation] = useState<any>();
  const [stockProduct, setStockProduct] = useState(0);
  const [price, setPrice] = useState<string|number>(0);
  const [notes, setNotes] = useState("");

  async function pushDataStock() {
    let findData = defaultProducs?.find((data) => {
      return data.id === selectedProduct;
    });
    if (findData) {
      const { result, error } = await createData(`Inventory/Storage/StockIn`, {
        location: selectedLocation,
        idProduct: findData?.idProduct,
        nameProduct: findData?.nameProduct,
        stockProduct,
        Client: selectedClient,
        PIC: selectedStaff,
        OrderData: orderDate.toDate("Asia/Singapore").valueOf(),
        ArrivalData: arrivalDate.toDate("Asia/Singapore").valueOf(),
        statusProduct: selectedStatus,
        note: notes,
        price: Number(price),
      });
      if (!error) {
        delete findData.id;
        delete findData.nomor;
        console.log("selected location ", selectedLocation);
        console.log("stock ", findData.stock_id);
        if (selectedLocation === "Indonesia") {
          if (findData.stock_id !== undefined) {
            console.log("masuk 	if stock_id");
            findData.stock_id += stockProduct;
          } else {
            console.log("masuk esle stock_id");
            findData.stock_id = stockProduct;
          }
        } else {
          if (findData.stock_sg !== undefined) {
            console.log("masuk 	if stock_sg");
            findData.stock_sg += stockProduct;
          } else {
            console.log("masuk else  stock_sg");
            findData.stock_sg = stockProduct;
          }
        }
        console.log("selected product ", selectedProduct);
        console.log("selectedProducts ", findData);

        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          selectedProduct,
          findData
        );
        if (!error) {
          setselectedProduct("");
          setselectedClient(undefined);
          setselectedStaff(undefined);
          setNotes("");
          setStockProduct(0);
          setPrice(0);
          setSelectedLocation(undefined);
          setselectedStatus(undefined);
          toast.success("Add Stock In Succesful");

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
        location: selectedLocation,
        category: selectedCategory,
        idProduct: findData?.idProduct,
        nameProduct: findData?.nameProduct,
        platform: "",
        stockProduct,
        PIC: selectedStaff,
        OrderData: orderDate.toDate("Asia/Singapore").valueOf(),
        ArrivalData: arrivalDate.toDate("Asia/Singapore").valueOf(),
        price: Number(price),
        note: notes,
      });
      if (!error) {
        delete findData.id;
        delete findData.nomor;
        if (selectedLocation === "Indonesia") {
          if (findData.stock_id !== undefined) {
            findData.stock_id -= stockProduct;
          } else {
            findData.stock_id = -stockProduct;
          }
        } else {
          if (findData.stock_sg !== undefined) {
            findData.stock_sg -= stockProduct;
          } else {
            findData.stock_sg = -stockProduct;
          }
        }
        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          selectedProduct,
          findData
        );
        if (!error) {
          setselectedProduct(undefined);
          setselectedClient(undefined);
          setselectedStaff(undefined);
          setNotes("");
          setSelectedLocation(undefined);
          setSelectedCategory(undefined);
          setPrice(0);
          toast.success("Add Stock Out Succesful");
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
  const handleSelectioClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedClient(e.target.value);
  };
  const handleSelectioStaff = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedStaff(e.target.value);
  };
  const handleSelectioStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setselectedStatus(e.target.value);
  };
  const handleSelectioLocation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };
  const handleSelectioCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  const handleSelectioPlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value);
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
            scrollBehavior="inside"
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Add Stock Product
                  </ModalHeader>
                  <ModalBody>
                    <Select
                      isRequired
                      items={baseLocation}
                      label="Choose Location"
                      placeholder="Select an Country"
                      selectedKeys={[selectedLocation]}
                      onChange={handleSelectioLocation}
                    >
                      {(status) => (
                        <SelectItem key={status?.id}>
                          {status.location}
                        </SelectItem>
                      )}
                    </Select>
                    <Autocomplete
                      isRequired
                      autoFocus
                      defaultItems={defaultProducs}
                      label="Choose Product"
                      placeholder="Select an Product"
                      labelPlacement="outside"
                      selectedKey={selectedProduct}
                      onSelectionChange={setselectedProduct}
                    >
                      {(product) => (
                        <AutocompleteItem key={product.id || product.idProduct}>
                          {`(${product.idProduct}) - ${product?.nameProduct}`}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <Select
                      required={true}
                      items={client}
                      label="Choose Client"
                      placeholder="Select an Client"
                      selectedKeys={[selectedClient]}
                      onChange={handleSelectioClient}
                    >
                      {(clients) => (
                        <SelectItem key={clients?.Client}>
                          {clients.Client}
                        </SelectItem>
                      )}
                    </Select>
                    <div>
                      <h2>Order Date</h2>
                      <Popover showArrow offset={10} placement="right-start">
                        <div className="flex w-full justify-between bg-gray-100 p-2 rounded-lg">
                          <p>{orderDate.toString()}</p>
                          <PopoverTrigger className="bg-gray-100">
                            <Button>
                              <FaRegCalendarAlt />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent>
                          {(titleProps) => (
                            <div {...titleProps}>
                              <Calendar
                                aria-label="Date (Controlled Focused Value)"
                                focusedValue={orderDate}
                                value={orderDate}
                                onFocusChange={setOrderDate}
                                classNames={{
                                  gridBody: "grid",
                                  gridHeaderRow: "justify-around",
                                  gridBodyRow: "justify-around",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <h2>Arrival Date</h2>
                      <Popover showArrow offset={10} placement="right-start">
                        <div className="flex w-full justify-between bg-gray-100 p-2 rounded-lg">
                          <p>{arrivalDate.toString()}</p>
                          <PopoverTrigger className="bg-gray-100">
                            <Button>
                              <FaRegCalendarAlt />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent>
                          {(titleProps) => (
                            <div {...titleProps}>
                              <Calendar
                                aria-label="Date (Controlled Focused Value)"
                                focusedValue={arrivalDate}
                                value={arrivalDate}
                                onFocusChange={setArrivalDate}
                                classNames={{
                                  gridBody: "grid",
                                  gridHeaderRow: "justify-around",
                                  gridBodyRow: "justify-around",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      isRequired
                      label="Quantity Product"
                      labelPlacement="outside"
                      // className="grid-rows-1 gap-"
                      type="text"
                      variant="bordered"
                      value={stockProduct.toString()}
                      onValueChange={(data) => setStockProduct(Number(data))}
                    />

                    {selectedLocation && selectedLocation !== "" && (
                      <div className="w-full ">
                        {selectedLocation === "Indonesia" ? (
                          <div className="w-full">
                            <CurrencyInput
                              value={price}
                              intlConfig={{ locale: "id-ID", currency: "IDR" }}
                              placeholder="Please enter price"
                              className="bg-gray-100 py-2 px-1 rounded-md w-full"
                              onValueChange={(value) => {
                                console.log("value ", value);
                                setPrice(
                                  Number(value !== undefined ? value : 0)
                                );
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full">
                            <CurrencyInput
                              value={price}
                              intlConfig={{ locale: "en-SG", currency: "SGD" }}
                              defaultValue={0}
                              decimalsLimit={2}
                              placeholder="Please enter price"
                              className="bg-gray-100 py-2 px-1 rounded-md w-full"
                              onValueChange={(value) =>
                                setPrice(
                                  (value !== undefined ? value : 0)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <Select
                      items={statusProduct}
                      label="Choose Status"
                      placeholder="Select an Status"
                      selectedKeys={[selectedStatus]}
                      onChange={handleSelectioStatus}
                    >
                      {(status) => (
                        <SelectItem key={status?.status}>
                          {status.status}
                        </SelectItem>
                      )}
                    </Select>
                    <Select
                      isRequired
                      items={staff}
                      label="Choose PIC"
                      placeholder="Select an PIC"
                      selectedKeys={[selectedStaff]}
                      onChange={handleSelectioStaff}
                    >
                      {(staffs) => (
                        <SelectItem key={staffs?.name}>
                          {staffs.name}
                        </SelectItem>
                      )}
                    </Select>
                    <Textarea
                      label="Notes"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      // className="max-w-xs"
                      value={notes}
                      onValueChange={setNotes}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={pushDataStock}
                      size="lg"
                      isDisabled={
                        !selectedProduct ||
                        selectedProduct === "" ||
                        stockProduct === 0 ||
                        !selectedStaff ||
                        selectedStaff === "" ||
                        !selectedLocation ||
                        selectedLocation === ""
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
            scrollBehavior="inside"
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Stock Out Product
                  </ModalHeader>
                  <ModalBody>
                    <Select
                      isRequired
                      items={baseLocation}
                      label="Choose Location"
                      placeholder="Select an Country"
                      selectedKeys={[selectedLocation]}
                      onChange={handleSelectioLocation}
                    >
                      {(status) => (
                        <SelectItem key={status?.id}>
                          {status.location}
                        </SelectItem>
                      )}
                    </Select>
                    <Select
                      isRequired
                      items={category}
                      label="Choose Category"
                      placeholder="Select an Category"
                      selectedKeys={[selectedCategory]}
                      onChange={handleSelectioCategory}
                    >
                      {(clients) => (
                        <SelectItem key={clients?.name}>
                          {clients.name}
                        </SelectItem>
                      )}
                    </Select>
                    <Autocomplete
                      isRequired
                      autoFocus
                      defaultItems={defaultProducs}
                      label="Choose Product"
                      placeholder="Select an Product"
                      labelPlacement="outside"
                      selectedKey={selectedProduct}
                      onSelectionChange={setselectedProduct}
                    >
                      {(product) => (
                        <AutocompleteItem key={product.id || product.idProduct}>
                          {`(${product.idProduct}) - ${product?.nameProduct}`}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <div>
                      <h2>Order Date</h2>
                      <Popover showArrow offset={10} placement="right-start">
                        <div className="flex w-full justify-between bg-gray-100 p-2 rounded-lg">
                          <p>{orderDate.toString()}</p>
                          <PopoverTrigger className="bg-gray-100">
                            <Button>
                              <FaRegCalendarAlt />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent>
                          {(titleProps) => (
                            <div {...titleProps}>
                              <Calendar
                                aria-label="Date (Controlled Focused Value)"
                                focusedValue={orderDate}
                                value={orderDate}
                                onFocusChange={setOrderDate}
                                classNames={{
                                  gridBody: "grid",
                                  gridHeaderRow: "justify-around",
                                  gridBodyRow: "justify-around",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <h2>Arrival Date</h2>
                      <Popover showArrow offset={10} placement="right-start">
                        <div className="flex w-full justify-between bg-gray-100 p-2 rounded-lg">
                          <p>{arrivalDate.toString()}</p>
                          <PopoverTrigger className="bg-gray-100">
                            <Button>
                              <FaRegCalendarAlt />
                            </Button>
                          </PopoverTrigger>
                        </div>
                        <PopoverContent>
                          {(titleProps) => (
                            <div {...titleProps}>
                              <Calendar
                                aria-label="Date (Controlled Focused Value)"
                                focusedValue={arrivalDate}
                                value={arrivalDate}
                                onFocusChange={setArrivalDate}
                                classNames={{
                                  gridBody: "grid",
                                  gridHeaderRow: "justify-around",
                                  gridBodyRow: "justify-around",
                                }}
                              />
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      isRequired
                      label="Quantity Product"
                      labelPlacement="outside"
                      // className="grid-rows-1 gap-"
                      type="text"
                      variant="bordered"
                      value={stockProduct.toString()}
                      onValueChange={(data) => setStockProduct(Number(data))}
                    />
                    {selectedLocation && selectedLocation !== "" && (
                      <div className="w-full ">
                        {selectedLocation === "Indonesia" ? (
                          <div className="w-full">
                            <CurrencyInput
                              value={price}
                              intlConfig={{ locale: "id-ID", currency: "IDR" }}
                              placeholder="Please enter price"
                              className="bg-gray-100 py-2 px-1 rounded-md w-full"
                              onValueChange={(value) =>
                                setPrice(
                                  Number(value !== undefined ? value : 0)
                                )
                              }
                            />
                          </div>
                        ) : (
                          <div className="w-full">
                            <CurrencyInput
                              value={price}
                              intlConfig={{ locale: "en-SG", currency: "SGD" }}
                              defaultValue={0}
                              decimalsLimit={2}
                              placeholder="Please enter price"
                              className="bg-gray-100 py-2 px-1 rounded-md w-full"
                              onValueChange={(value) =>
                                setPrice(
                                  (value !== undefined ? value : 0)
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <Select
                      items={statusProduct}
                      label="Choose Status"
                      placeholder="Select an Status"
                      selectedKeys={[selectedStatus]}
                      onChange={handleSelectioStatus}
                    >
                      {(status) => (
                        <SelectItem key={status?.status}>
                          {status.status}
                        </SelectItem>
                      )}
                    </Select>
                    <Select
                      required={true}
                      items={staff}
                      label="Choose PIC"
                      placeholder="Select an PIC"
                      selectedKeys={[selectedStaff]}
                      onChange={handleSelectioStaff}
                    >
                      {(staffs) => (
                        <SelectItem key={staffs?.name}>
                          {staffs.name}
                        </SelectItem>
                      )}
                    </Select>
                    <Select
                      isRequired
                      items={platform}
                      label="Choose Platform Store"
                      placeholder="Select an Platform Store"
                      selectedKeys={[selectedPlatform]}
                      onChange={handleSelectioPlatform}
                    >
                      {(status) => (
                        <SelectItem key={status?.name}>
                          {status.name}
                        </SelectItem>
                      )}
                    </Select>
                    <Textarea
                      label="Notes"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={notes}
                      onValueChange={setNotes}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      isDisabled={
                        !selectedProduct ||
                        selectedProduct === "" ||
                        stockProduct === 0 ||
                        selectedCategory === "" ||
                        !selectedCategory ||
                        !selectedLocation ||
                        selectedLocation === "" ||
                        !selectedPlatform ||
                        selectedPlatform === ""
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
  const getDataClient = useCallback(async () => {
    const { result, error } = await getDataCollection(`Inventory/Admin/Client`);
    if (!error) {
      setClient(result);
    } else {
      return toast("ERROR, Get Data Client Error, Please Try Again !");
    }
  }, []);
  const getDataCategory = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Admin/CategoryProductOut`
    );
    if (!error) {
      setCategory(result);
    } else {
      return toast("ERROR, Get Data Category Error Please Try Again !");
    }
  }, []);
  const getDataPIC = useCallback(async () => {
    const { result, error } = await getDataCollection(`Inventory/Admin/PIC`);
    if (!error) {
      setStaff(result);
    } else {
      return toast("ERROR, Get Data PIC Error Please Try Again !");
    }
  }, []);
  const getDataPlatform = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Admin/PlatformStore`
    );
    if (!error) {
      setPlatform(result);
    } else {
      return toast("ERROR, Get Data Platform Store Error Please Try Again !");
    }
  }, []);

  const getDataProducts = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/Products`
    );
    if (!error) {
      setDefaultProducs(result);
    } else {
      return toast("ERROR, Get Data Products Error Please Try Again !");
    }
  }, []);

  useEffect(() => {
    setOnRefresh(true);
    getDataClient();
    getDataProducts();
    getDataPIC();
    getDataCategory();
    getDataPlatform();
    setOnRefresh(false);
  }, [
    getDataCategory,
    getDataClient,
    getDataPIC,
    getDataPlatform,
    getDataProducts,
  ]);

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
