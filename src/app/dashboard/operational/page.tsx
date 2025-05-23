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
  Pagination,
  Tooltip,
  CircularProgress,
} from "@nextui-org/react";
import { platform } from "os";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { today, getLocalTimeZone } from "@internationalized/date";
import {
  FaChevronDown,
  FaEdit,
  FaPlus,
  FaRegCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import CurrencyInput from "react-currency-input-field";
import { onGetExporProduct } from "@/components/export/exportExcel";
import { BsCheckLg } from "react-icons/bs";
import { IoMdBarcode, IoMdEye } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";

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
const INITIAL_VISIBLE_COLUMNS = [
  "idProduct",
  "name",
  "stock",
  "pic",
  "actions",
];

type ProductType = {
  description: string;
  id: string;
  idProduct: string;
  image: string;
  nameProduct: string;
  nomor: string;
  notes: string;
  status: string;
  stock_id: number;
  stock_sg: number;
  type: string;
}[];

type StockType = {
  description: string;
  id: string;
  idProduct: string;
  image: string;
  nameProduct: string;
  PIC: string;
  OrderData: string;
  ArrivalData: string;
  status: string;
  stockProduct: number;
  price: number;
  location: string;
  Client: string;
  statusProduct: string;
  note: string;
};

export default function Operational() {
  const [onRefresh, setOnRefresh] = useState(true);
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
  const [defaultProducsStockIn, setDefaultProducsStockIn] = useState<
    ProductType | any
  >();
  const [defaultProducsStockOut, setDefaultProducsStockOut] = useState<
    ProductType | any
  >();
  const [selectedProduct, setselectedProduct] = useState<any>();
  const [selectedClient, setselectedClient] = useState<any>();
  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [selectedStaff, setselectedStaff] = useState<any>();
  const [selectedStatus, setselectedStatus] = useState<any>();
  const [selectedPlatform, setSelectedPlatform] = useState<any>();
  const [selectedLocation, setSelectedLocation] = useState<any>();
  const [stockProduct, setStockProduct] = useState(0);
  const [price, setPrice] = useState<string | number>(0);
  const [notes, setNotes] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [defaultProduct, setDefaultProduct] = useState<any>();
  const [showTable, setshowTable] = useState<any>();
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "nameProduct",
    direction: "ascending",
  });
  const [showData, setShowData] = useState<"stockin" | "stockout">("stockin");
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set([]));

  const statusOptions = useMemo(
    () => [
      { name: "Available", uid: "Available" },
      { name: "Paused", uid: "paused" },
      { name: "Vacation", uid: "vacation" },
    ],
    []
  );
  const [visibleColumns, setVisibleColumns] = useState<any>(
    INITIAL_VISIBLE_COLUMNS
  );
  const columns = useMemo(
    () => [
      { name: "ID Product", uid: "idProduct", sortable: true },
      { name: "NAME", uid: "name", sortable: true },
      // { name: "STOCK", uid: "stock", sortable: true },
      { name: "ORDER DATE", uid: "orderDate", sortable: true },
      { name: "PIC", uid: "pic", sortable: true },
      { name: "Quantity", uid: "stock", sortable: true },
      { name: "Price", uid: "price", sortable: true },
      { name: "ACTIONS", uid: "actions" },
    ],
    []
  );

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
        if (selectedLocation === "Indonesia") {
          if (findData.stock_id !== undefined) {
            findData.stock_id += stockProduct;
          } else {
            findData.stock_id = stockProduct;
          }
        } else {
          if (findData.stock_sg !== undefined) {
            findData.stock_sg += stockProduct;
          } else {
            findData.stock_sg = stockProduct;
          }
        }

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
          onClose();
          setOnRefresh(true);
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
          setOnRefresh(true);
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
      );
    } else if (modal === "delete") {
      return (
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
      );
    } else if (modal === "StockIn") {
      return (
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
                    // autoFocus
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
                              setPrice(Number(value !== undefined ? value : 0));
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
                              setPrice(value !== undefined ? value : 0)
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
                      <SelectItem key={staffs?.name}>{staffs.name}</SelectItem>
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
      );
    } else if (modal === "StockOut") {
      return (
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
                    // autoFocus
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
                              setPrice(Number(value !== undefined ? value : 0))
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
                              setPrice(value !== undefined ? value : 0)
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
                      <SelectItem key={staffs?.name}>{staffs.name}</SelectItem>
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
                      <SelectItem key={status?.name}>{status.name}</SelectItem>
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

  // const getDataProducts = useCallback(async () => {
  //   const { result, error } = await getDataCollection(
  //     `Inventory/Storage/Products`
  //   );
  //   if (!error) {
  //     setDefaultProducs(result);
  //   } else {
  //     return toast("ERROR, Get Data Products Error Please Try Again !");
  //   }
  // }, []);
  const getDataStockout = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/StockOut`
    );
    if (!error) {
      setDefaultProducsStockOut(result);
    } else {
      return toast("ERROR, Get Data Products Error Please Try Again !");
    }
  }, []);
  const getDataStockin = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/StockIn`
    );
    if (!error) {
      setDefaultProducsStockIn(result);
    } else {
      return toast("ERROR, Get Data Products Error Please Try Again !");
    }
  }, []);

  const firstRender = useCallback(async () => {
    await getDataClient();
    // getDataProducts();
    await getDataPIC();
    await getDataCategory();
    await getDataPlatform();
    await getDataStockout();
    await getDataStockin();
    console.log("first render");
    setOnRefresh(false);
  }, [
    getDataCategory,
    getDataClient,
    getDataPIC,
    getDataPlatform,
    getDataStockin,
    getDataStockout,
  ]);

  useEffect(() => {
    if (onRefresh) {
      firstRender();
    }
  }, [firstRender, onRefresh]);

  // return (
  //   <div className="flex flex-col p-5">
  //     {renderModal()}
  //     <div>Operational</div>
  //     <div className="flex flex-row justify-between">
  //       <div>Add Stock Product</div>
  //       <div>
  //         <Button onPress={openStockInModal}>Add More</Button>
  //       </div>
  //     </div>

  //     <div className="flex flex-row justify-between">
  //       <div>Stock Out Product</div>
  //       <div>
  //         <Button onPress={openStockOutModal}>Stock Out</Button>
  //       </div>
  //     </div>
  //   </div>
  // );
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    // let filteredUsers = [...(showTable ?? [{}])];
    let filteredUsers = [
      ...((showData === "stockin"
        ? defaultProducsStockIn
        : defaultProducsStockOut) ?? [{}]),
    ];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user?.idProduct?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.status)
      );
    }
    return filteredUsers;
  }, [
    showData,
    defaultProducsStockIn,
    defaultProducsStockOut,
    hasSearchFilter,
    statusFilter,
    statusOptions.length,
    filterValue,
  ]);

  const pages = Math.ceil(filteredItems?.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return [...filteredItems]
      .sort((a: ProductType, b: ProductType) => {
        const first = a[sortDescriptor.column as keyof ProductType] as number;
        const second = b[sortDescriptor.column as keyof ProductType] as number;
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      })
      .slice(start, end);
  }, [
    filteredItems,
    page,
    rowsPerPage,
    sortDescriptor.column,
    sortDescriptor.direction,
  ]);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);
  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);
  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  const onRowsPerPageChange = useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const exportExcel = useCallback(async () => {
    const dataToExport = (
      showData === "stockin" ? defaultProducsStockIn : defaultProducsStockOut
    ).map((product: StockType) => ({
      ID: product.idProduct,
      "Product Name": product.nameProduct,
      Quantity: product.stockProduct,
      // "Singapore Price": product.priceSG,
      PIC: product.PIC,
      "Order Date": new Date(product?.OrderData).toLocaleDateString(),
      "Arrival Date": new Date(product?.ArrivalData).toLocaleDateString(),
      Location: product.location,
      Price: product.price,
      Client: product.Client,
      Status: product.statusProduct,
      Note: product.statusProduct,
    }));
    await onGetExporProduct(
      `Inventory Website ${showData.toUpperCase()}`,
      "Batch 1",
      dataToExport
    );
  }, [defaultProducsStockIn, defaultProducsStockOut, showData]);
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            aria-label="Search Input"
            isClearable
            classNames={{
              innerWrapper: "w-[100%]  ",
              inputWrapper: "w-[100%]",
            }}
            className="w-[30vw] sm:max-w-[44%]"
            placeholder="Search"
            startContent={<FaSearch />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {/* <Dropdown classNames={{ content: "w-50v data-[open=true]:bg-red" }}>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
                color="primary"
              >
                {statusOptions.map((status) => (
                  <DropdownItem
                    key={status.uid}
                    className="capitalize"
                    selectedIcon={(data) =>
                      data.isSelected ? <BsCheckLg /> : null
                    }
                  >
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown> */}
            <Button
              color="primary"
              isDisabled={showData === "stockin"}
              // endContent={<FaPlus />}
              onPress={() => setShowData("stockin")}
            >
              Stock In
            </Button>
            <Button
              color="primary"
              isDisabled={showData === "stockout"}
              // endContent={<FaPlus />}
              onPress={() => {
                setShowData("stockout");
              }}
            >
              Stock Out
            </Button>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem
                    key={column.uid}
                    className="capitalize"
                    selectedIcon={(data) =>
                      data.isSelected ? <BsCheckLg /> : null
                    }
                  >
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              endContent={<FaPlus />}
              onPress={openStockInModal}
            >
              Add Stock In
            </Button>
            <Button
              color="primary"
              endContent={<FaPlus />}
              onPress={openStockOutModal}
            >
              Add StockOut
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {defaultProduct?.length} Product
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    showData,
    visibleColumns,
    columns,
    openStockInModal,
    openStockOutModal,
    defaultProduct?.length,
    onRowsPerPageChange,
    onClear,
  ]);
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <div>
          <Button
            color="primary"
            endContent={<RiFileExcel2Fill />}
            onPress={exportExcel}
          >
            Export Product
          </Button>
          <span className="text-small text-default-400 hidden md:flex">
            {selectedKeys === "all"
              ? "All items selected"
              : `${selectedKeys.size} of ${items.length} selected`}
          </span>
        </div>
      </div>
    );
  }, [hasSearchFilter, page, pages, selectedKeys, items.length]);

  type propsBody = {
    item: any;
    columnKey: any;
    onDetail?: (items: any) => void;
    onBarcode?: (items: any) => void;
    onEdit?: (items: any) => void;
    onDelete?: (items: any) => void;
  };
  const renderBody = useCallback(
    ({ item, columnKey, onDetail, onEdit, onDelete, onBarcode }: propsBody) => {
      const cellValue = item[columnKey];
      if (showData === "stockin") {
        switch (columnKey) {
          case "stock":
            return <p>{item.stockProduct}</p>;
          case "idProduct":
            return <p>{item?.idProduct}</p>;
          case "name":
            return <p>{item?.nameProduct}</p>;
          case "orderDate":
            return (
              <p>
                {item?.OrderData
                  ? new Date(item?.OrderData).toLocaleDateString()
                  : "NOT SET"}
              </p>
            );
          case "pic":
            return <p>{item?.PIC}</p>;
          case "price":
            return <p>{item?.price}</p>;
          case "actions":
            return (
              <div className="relative flex items-center gap-2">
                {onBarcode && (
                  <Tooltip content="Barcode">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      // onClick={() => onBarcode(item)}
                    >
                      <IoMdBarcode />
                    </span>
                  </Tooltip>
                )}

                {onDetail && (
                  <Tooltip content="Details">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      onClick={() => onDetail(item)}
                    >
                      <IoMdEye />
                    </span>
                  </Tooltip>
                )}
                {onEdit && (
                  <Tooltip content="Edit user">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      // onClick={() => onEdit(item)}
                    >
                      <FaEdit />
                    </span>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip color="danger" content="Delete user">
                    <span
                      className="text-lg text-danger cursor-pointer active:opacity-50"
                      onClick={() => onDelete(item)}
                    >
                      <MdDeleteForever />
                    </span>
                  </Tooltip>
                )}
              </div>
            );

          default:
            return cellValue;
        }
      } else {
        switch (columnKey) {
          case "stock":
            return <p>{item.stockProduct}</p>;
          case "idProduct":
            return <p>{item?.idProduct}</p>;
          case "name":
            return <p>{item?.nameProduct}</p>;
          case "orderDate":
            return (
              <p>
                {item?.OrderData
                  ? new Date(item?.OrderData).toLocaleDateString()
                  : "NOT SET"}
              </p>
            );
          case "pic":
            return <p>{item?.PIC}</p>;
          case "price":
            return <p>{item?.price}</p>;
          case "actions":
            return (
              <div className="relative flex items-center gap-2">
                {onBarcode && (
                  <Tooltip content="Barcode">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      // onClick={() => onBarcode(item)}
                    >
                      <IoMdBarcode />
                    </span>
                  </Tooltip>
                )}

                {onDetail && (
                  <Tooltip content="Details">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      onClick={() => onDetail(item)}
                    >
                      <IoMdEye />
                    </span>
                  </Tooltip>
                )}
                {onEdit && (
                  <Tooltip content="Edit user">
                    <span
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                      // onClick={() => onEdit(item)}
                    >
                      <FaEdit />
                    </span>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip color="danger" content="Delete user">
                    <span
                      className="text-lg text-danger cursor-pointer active:opacity-50"
                      onClick={() => onDelete(item)}
                    >
                      <MdDeleteForever />
                    </span>
                  </Tooltip>
                )}
              </div>
            );

          default:
            return cellValue;
        }
      }
    },
    [showData]
  );

  if (onRefresh) {
    return <CircularProgress aria-label="Loading..." />;
  } else {
    return (
      <div className="flex justify-center items-center sm:px-5">
        {renderModal()}
        <Table
          isHeaderSticky
          topContent={topContent}
          topContentPlacement="outside"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column?.uid}
                align={column?.uid === "actions" ? "center" : "start"}
                allowsSorting={column?.sortable}
              >
                {column?.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"No users found"} items={sortedItems}>
            {(item) => (
              <TableRow key={item.id ?? "Table Row"}>
                {(columnKey) => (
                  <TableCell>
                    {renderBody({
                      item: item,
                      columnKey: columnKey,
                      // onDelete: (item) => openDelete(item),
                      // onDetail: (item) => openDetail(item),
                      // onBarcode: (item) => openBarcode(item),
                      // onEdit: (item) => openEdit(item),
                    })}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}
