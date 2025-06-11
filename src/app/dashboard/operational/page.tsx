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
import * as XLSX from "xlsx";
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
  priceSG?: string | number;
  priceID?: string | number;
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

type InvoiceType = {
  id?: string;
  invoiceNumber: string;
  date: number;
  supplier: string;
  supplierId: string;
  quantity: number;
  unit: string;
  subTotal: number;
  shippingFee: number;
  totalInvoice: number;
  currency: "IDR" | "SGD" | "USD";
  status: "Received" | "Pending" | "Completed" | "Cancelled";
  notes: string;
  attachmentUrl?: string;
  location: string;
  PIC: string;
};

type ImportInvoice = {
  invoiceNumber: string;
  supplier: string;
  quantity: number;
  unit: string;
  subTotal: number;
  shippingFee: number;
  totalInvoice: number;
  currency: "IDR" | "SGD";
  status: "Active" | "Pending" | "Completed" | "Cancelled";
  notes: string;
  location: string;
  PIC: string;
};

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
  invoiceId: string; // Changed from Client to invoiceId
  statusProduct: string;
  note: string;
};

export default function Operational() {
  const [onRefresh, setOnRefresh] = useState(true);
  const defaultDate = today("asia/singapore");
  const [orderDate, setOrderDate] = useState(defaultDate);
  const [arrivalDate, setArrivalDate] = useState(defaultDate);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = useState("add");
  const [client, setClient] = useState<{ id: string; Client: string }[]>();
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
  const [selectedInvoice, setSelectedInvoice] = useState<any>(); // New state for selected invoice
  const [invoices, setInvoices] = useState<any[]>([]); // New state for invoices list
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
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const [invoiceDate, setInvoiceDate] = useState(defaultDate);
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState("");
  const [subTotal, setSubTotal] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [totalInvoice, setTotalInvoice] = useState<number>(0);
  const [currency, setCurrency] = useState<"IDR" | "SGD" | "USD">("USD");
  const [invoiceStatus, setInvoiceStatus] = useState<
    "Received" | "Pending" | "Completed" | "Cancelled"
  >("Received");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleSelectioSupplier = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSupplier(e.target.value);
  };

  const pushInvoiceData = async () => {
    const selectedClientData = client?.find(
      (c) => c.Client === selectedSupplier
    );

    const { result, error } = await createData(`Inventory/Storage/Invoices`, {
      invoiceNumber,
      supplier: selectedSupplier,
      supplierId: selectedClientData?.id || selectedSupplier,
      date: invoiceDate.toDate("Asia/Singapore").valueOf(),
      location: selectedLocation,
      PIC: selectedStaff,
      quantity,
      unit,
      subTotal,
      shippingFee,
      totalInvoice,
      currency,
      status: invoiceStatus,
      notes: invoiceNotes,
    });

    if (!error) {
      setInvoiceNumber("");
      setSelectedSupplier(undefined);
      setInvoiceDate(defaultDate);
      setQuantity(0);
      setUnit("");
      setSubTotal(0);
      setShippingFee(0);
      setTotalInvoice(0);
      setCurrency("USD");
      setInvoiceStatus("Received");
      setInvoiceNotes("");
      setSelectedLocation(undefined);
      setselectedStaff(undefined);
      toast.success("Invoice Added Successfully");
      onClose();
      setOnRefresh(true);
    } else {
      toast.error("Failed to add invoice. Please try again.");
    }
  };

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

  const getDataInvoices = useCallback(async () => {
    const { result, error } = await getDataCollection(
      `Inventory/Storage/Invoices`
    );
    if (!error) {
      setInvoices(result);
    } else {
      return toast("ERROR, Get Data Invoices Error Please Try Again !");
    }
  }, []);

  async function pushDataStock() {
    try {
      // Find product data
      const findData = defaultProducs?.find(
        (data) => data.id === selectedProduct
      );
      if (!findData) {
        toast.error("Product not found");
        return;
      }

      // Find invoice data
      const invoiceData = invoices?.find((inv) => inv.id === selectedInvoice);
      if (!invoiceData) {
        toast.error("Invoice not found");
        return;
      }

      // Create stock in record
      const { error: createError } = await createData(
        `Inventory/Storage/StockIn`,
        {
          location: selectedLocation,
          idProduct: findData.idProduct,
          nameProduct: findData.nameProduct,
          stockProduct,
          invoiceId: selectedInvoice,
          PIC: selectedStaff,
          OrderData: orderDate.toDate("Asia/Singapore").valueOf(),
          ArrivalData: arrivalDate.toDate("Asia/Singapore").valueOf(),
          statusProduct: selectedStatus,
          note: notes,
          price: Number(price),
          supplier: invoiceData.supplier,
          supplierId: invoiceData.supplierId,
        }
      );

      if (createError) {
        toast.error("Failed to create stock in record");
        return;
      }

      // Update product stock
      const productUpdate = { ...findData };
      delete productUpdate.id;
      delete productUpdate.nomor;

      if (selectedLocation === "Indonesia") {
        productUpdate.stock_id = (productUpdate.stock_id || 0) + stockProduct;
      } else {
        productUpdate.stock_sg = (productUpdate.stock_sg || 0) + stockProduct;
      }

      const { error: updateError } = await updateData(
        "Inventory/Storage/Products",
        selectedProduct,
        productUpdate
      );

      if (updateError) {
        toast.error("Failed to update product stock");
        return;
      }

      // Reset form
      setselectedProduct("");
      setSelectedInvoice(undefined);
      setselectedStaff(undefined);
      setNotes("");
      setStockProduct(0);
      setPrice(0);
      setSelectedLocation(undefined);
      setselectedStatus(undefined);

      toast.success("Stock In Added Successfully");
      onClose();
      setOnRefresh(true);
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error("Failed to add stock");
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
                    defaultItems={defaultProducs || []}
                    label="Choose Product"
                    placeholder="Select an Product"
                    labelPlacement="outside"
                    selectedKey={selectedProduct}
                    onSelectionChange={setselectedProduct}
                  >
                    {(product) => (
                      <AutocompleteItem key={product.id ?? product.idProduct}>
                        {`(${product.idProduct}) - ${product?.nameProduct}`}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                  <Select
                    isRequired
                    items={invoices || []}
                    label="Choose Invoice"
                    placeholder="Select an Invoice"
                    selectedKeys={[selectedInvoice]}
                    onChange={(e) => setSelectedInvoice(e.target.value)}
                  >
                    {(invoice) => (
                      <SelectItem key={invoice?.id}>
                        {`${invoice.invoiceNumber} - ${invoice.supplier}`}
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
                    items={statusProduct || []}
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
                    items={staff || []}
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
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        color="primary"
                        className="w-1/2"
                        onPress={downloadStockInTemplate}
                        startContent={<RiFileExcel2Fill />}
                      >
                        Download Template
                      </Button>
                      <Button
                        className="w-1/2"
                        isLoading={isImporting}
                        isDisabled={isImporting}
                      >
                        <label
                          htmlFor="stockin-file-upload"
                          className="cursor-pointer w-full py-2 px-4"
                        >
                          {isImporting ? "Importing..." : "Import Excel"}
                        </label>
                        <input
                          id="stockin-file-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsImporting(true);
                              try {
                                const file = e.target.files[0];
                                toast.info("Parsing Excel file...");
                                const importedData =
                                  await parseStockInExcelFile(file);

                                toast.info(
                                  `Found ${importedData.length} stock entries. Starting import...`
                                );

                                let successCount = 0;
                                let errorCount = 0;

                                for (const item of importedData) {
                                  try {
                                    // Find product data
                                    const productData = defaultProducs?.find(
                                      (p) => p.idProduct === item.idProduct
                                    );

                                    if (!productData) {
                                      throw new Error(
                                        `Product not found: ${item.idProduct}`
                                      );
                                    }
                                    const stockInData = { ...item };
                                    stockInData.idProduct = productData.id;

                                    // Create stock in record
                                    await createData(
                                      `Inventory/Storage/StockIn`,
                                      stockInData
                                    );

                                    // Update product stock
                                    if (item.location === "Indonesia") {
                                      if (productData.stock_id !== undefined) {
                                        productData.stock_id +=
                                          item.stockProduct;
                                      } else {
                                        productData.stock_id =
                                          item.stockProduct;
                                      }
                                      productData.priceID = item.price;
                                    } else {
                                      if (productData.stock_sg !== undefined) {
                                        productData.stock_sg +=
                                          item.stockProduct;
                                      } else {
                                        productData.stock_sg =
                                          item.stockProduct;
                                      }
                                      productData.priceSG = item.price;
                                    }

                                    // Update product data
                                    if (productData.id) {
                                      const { id, ...productUpdateData } =
                                        productData;
                                      await updateData(
                                        "Inventory/Storage/Products",
                                        productData.id,
                                        productUpdateData
                                      );
                                    }

                                    successCount++;
                                  } catch (error) {
                                    console.error(
                                      "Error importing stock:",
                                      error
                                    );
                                    errorCount++;
                                  }
                                }

                                if (successCount > 0) {
                                  toast.success(
                                    `Successfully imported ${successCount} stock entries`
                                  );
                                  setOnRefresh(true);
                                  onClose();
                                }
                                if (errorCount > 0) {
                                  toast.error(
                                    `Failed to import ${errorCount} stock entries`
                                  );
                                }
                              } catch (error: any) {
                                toast.error(`Import failed: ${error.message}`);
                              } finally {
                                setIsImporting(false);
                                e.target.value = "";
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Or add stock manually:
                    </p>
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
                        selectedLocation === "" ||
                        !selectedInvoice ||
                        selectedInvoice === ""
                      }
                      className="bg-greenbt text-white"
                    >
                      Add Stock Product
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    } else if (modal === "importInvoice") {
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
                  Import Invoice
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        color="primary"
                        className="w-1/2"
                        onPress={downloadInvoiceTemplate}
                        startContent={<RiFileExcel2Fill />}
                      >
                        Download Template
                      </Button>
                      <Button
                        className="w-1/2"
                        isLoading={isImporting}
                        isDisabled={isImporting}
                      >
                        <label
                          htmlFor="invoice-file-upload"
                          className="cursor-pointer w-full py-2 px-4"
                        >
                          {isImporting ? "Importing..." : "Choose Excel File"}
                        </label>
                        <input
                          id="invoice-file-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsImporting(true);
                              try {
                                const file = e.target.files[0];
                                toast.info("Parsing Excel file...");
                                const importedData =
                                  await parseInvoiceExcelFile(file);

                                toast.info(
                                  `Found ${importedData.length} invoices. Starting import...`
                                );

                                let successCount = 0;
                                let errorCount = 0;

                                for (const item of importedData) {
                                  // Find supplier ID from client data
                                  const supplierData = client?.find(
                                    (c) => c.Client === item.supplier
                                  );

                                  const newInvoice: InvoiceType = {
                                    // id: "", // Firebase will generate this
                                    invoiceNumber: item.invoiceNumber,
                                    supplier: item.supplier,
                                    supplierId:
                                      supplierData?.id ?? item.supplier,
                                    date: new Date(
                                      item.invoiceDate ?? new Date()
                                    ).valueOf(),
                                    quantity: item.quantity,
                                    unit: item.unit,
                                    subTotal: item.subTotal,
                                    shippingFee: item.shippingFee,
                                    totalInvoice: item.totalInvoice,
                                    currency: item.currency as
                                      | "IDR"
                                      | "SGD"
                                      | "USD",
                                    status: item.status as
                                      | "Received"
                                      | "Pending"
                                      | "Completed"
                                      | "Cancelled",
                                    notes: item.notes,
                                    location: item.location,
                                    PIC: item.PIC,
                                  };

                                  try {
                                    await createData(
                                      "Inventory/Storage/Invoices",
                                      newInvoice
                                    );
                                    // Update product stock
                                    // await updateData(
                                    //   "Inventory/Storage/Products",
                                    //   item.id,
                                    //   {
                                    //     stock_id:
                                    //       (item.stock_id || 0) + item.quantity,
                                    //   }
                                    // );
                                    successCount++;
                                  } catch (error) {
                                    console.error(
                                      "Error importing invoice:",
                                      error
                                    );
                                    errorCount++;
                                  }
                                }

                                if (successCount > 0) {
                                  toast.success(
                                    `Successfully imported ${successCount} invoices`
                                  );
                                  setOnRefresh(true);
                                  onClose();
                                }
                                if (errorCount > 0) {
                                  toast.error(
                                    `Failed to import ${errorCount} invoices`
                                  );
                                }
                              } catch (error: any) {
                                toast.error(`Import failed: ${error.message}`);
                              } finally {
                                setIsImporting(false);
                                e.target.value = "";
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Excel file should contain columns: Invoice Number, Invoice
                      Date (YYYY-MM-DD), Supplier, Quantity, Unit, Sub Total,
                      Shipping Fee, Total Invoice, Currency (IDR/SGD), Status,
                      Notes, Location, PIC
                    </p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={onClose}
                    className="bg-gray-500 text-white"
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    } else if (modal === "addInvoice") {
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
                  Add New Invoice
                </ModalHeader>
                <ModalBody>
                  <Select
                    isRequired
                    items={baseLocation}
                    label="Choose Location"
                    placeholder="Select a Location"
                    selectedKeys={[selectedLocation]}
                    onChange={handleSelectioLocation}
                  >
                    {(location) => (
                      <SelectItem key={location?.id}>
                        {location.location}
                      </SelectItem>
                    )}
                  </Select>
                  <Select
                    isRequired
                    items={staff || []}
                    label="Choose PIC"
                    placeholder="Select a PIC"
                    selectedKeys={[selectedStaff]}
                    onChange={handleSelectioStaff}
                  >
                    {(staffs) => (
                      <SelectItem key={staffs?.name}>{staffs.name}</SelectItem>
                    )}
                  </Select>
                  <Input
                    isRequired
                    label="Invoice Number"
                    labelPlacement="outside"
                    placeholder="Enter invoice number"
                    value={invoiceNumber}
                    onValueChange={setInvoiceNumber}
                  />
                  <Select
                    isRequired
                    items={client || []}
                    label="Choose Supplier"
                    placeholder="Select a Supplier"
                    selectedKeys={[selectedSupplier]}
                    onChange={handleSelectioSupplier}
                  >
                    {(supplier) => (
                      <SelectItem key={supplier?.Client}>
                        {supplier.Client}
                      </SelectItem>
                    )}
                  </Select>
                  <div>
                    <h2>Invoice Date</h2>
                    <Popover showArrow offset={10} placement="right-start">
                      <div className="flex w-full justify-between bg-gray-100 p-2 rounded-lg">
                        <p>{invoiceDate.toString()}</p>
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
                              focusedValue={invoiceDate}
                              value={invoiceDate}
                              onFocusChange={setInvoiceDate}
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
                    type="number"
                    label="Quantity"
                    labelPlacement="outside"
                    placeholder="Enter quantity"
                    value={quantity?.toString()}
                    onValueChange={(val) => setQuantity(Number(val))}
                  />
                  <Input
                    label="Unit"
                    labelPlacement="outside"
                    placeholder="Enter unit (e.g., pcs, kg, box)"
                    value={unit}
                    onValueChange={setUnit}
                  />
                  <Input
                    type="number"
                    label="Sub Total"
                    labelPlacement="outside"
                    placeholder="Enter sub total"
                    value={subTotal?.toString()}
                    onValueChange={(val) => setSubTotal(Number(val))}
                  />
                  <Input
                    type="number"
                    label="Shipping Fee"
                    labelPlacement="outside"
                    placeholder="Enter shipping fee"
                    value={shippingFee?.toString()}
                    onValueChange={(val) => setShippingFee(Number(val))}
                  />
                  <Input
                    type="number"
                    label="Total Invoice"
                    labelPlacement="outside"
                    placeholder="Enter total invoice amount"
                    value={totalInvoice?.toString()}
                    onValueChange={(val) => setTotalInvoice(Number(val))}
                  />
                  <Select
                    label="Currency"
                    placeholder="Select currency"
                    selectedKeys={[currency]}
                    onChange={(e) =>
                      setCurrency(e.target.value as "IDR" | "SGD" | "USD")
                    }
                  >
                    <SelectItem key="IDR">IDR</SelectItem>
                    <SelectItem key="SGD">SGD</SelectItem>
                    <SelectItem key="USD">USD</SelectItem>
                  </Select>
                  <Select
                    label="Invoice Status"
                    placeholder="Select status"
                    selectedKeys={[invoiceStatus]}
                    onChange={(e) =>
                      setInvoiceStatus(
                        e.target.value as
                          | "Received"
                          | "Pending"
                          | "Completed"
                          | "Cancelled"
                      )
                    }
                  >
                    <SelectItem key="Received">Received</SelectItem>
                    <SelectItem key="Pending">Pending</SelectItem>
                    <SelectItem key="Completed">Completed</SelectItem>
                    <SelectItem key="Cancelled">Cancelled</SelectItem>
                  </Select>
                  <Textarea
                    label="Notes"
                    labelPlacement="outside"
                    placeholder="Enter invoice notes"
                    value={invoiceNotes}
                    onValueChange={setInvoiceNotes}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={pushInvoiceData}
                    size="lg"
                    isDisabled={
                      !invoiceNumber ||
                      !selectedSupplier ||
                      !selectedLocation ||
                      !selectedStaff ||
                      !quantity ||
                      !unit ||
                      !subTotal ||
                      !totalInvoice
                    }
                    className="bg-greenbt text-white"
                  >
                    Add Invoice
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
                    items={category || []}
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
                    defaultItems={defaultProducs || []}
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
                    items={statusProduct || []}
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
                    items={staff || []}
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
                    items={platform || []}
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
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        color="primary"
                        className="w-1/2"
                        onPress={downloadStockOutTemplate}
                        startContent={<RiFileExcel2Fill />}
                      >
                        Download Template
                      </Button>
                      <Button
                        className="w-1/2"
                        isLoading={isImporting}
                        isDisabled={isImporting}
                      >
                        <label
                          htmlFor="stockout-file-upload"
                          className="cursor-pointer w-full py-2 px-4"
                        >
                          {isImporting ? "Importing..." : "Import Excel"}
                        </label>
                        <input
                          id="stockout-file-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsImporting(true);
                              try {
                                const file = e.target.files[0];
                                toast.info("Parsing Excel file...");
                                const importedData =
                                  await parseStockOutExcelFile(file);

                                toast.info(
                                  `Found ${importedData.length} stock entries. Starting import...`
                                );

                                let successCount = 0;
                                let errorCount = 0;

                                for (const item of importedData) {
                                  try {
                                    // Find product data
                                    const productData = defaultProducs?.find(
                                      (p) => p.idProduct === item.idProduct
                                    );

                                    if (!productData) {
                                      throw new Error(
                                        `Product not found: ${item.idProduct}`
                                      );
                                    }
                                    const stockOutData = { ...item };
                                    stockOutData.idProduct = productData.id;

                                    // Create stock out record
                                    await createData(
                                      `Inventory/Storage/StockOut`,
                                      stockOutData
                                    );

                                    // Update product stock
                                    if (item.location === "Indonesia") {
                                      if (productData.stock_id !== undefined) {
                                        productData.stock_id -=
                                          item.stockProduct;
                                      } else {
                                        productData.stock_id =
                                          -item.stockProduct;
                                      }

                                      // productData.priceID = item.price;
                                    } else {
                                      if (productData.stock_sg !== undefined) {
                                        productData.stock_sg -=
                                          item.stockProduct;
                                      } else {
                                        productData.stock_sg =
                                          -item.stockProduct;
                                      }
                                      // productData.priceSG = item.price;
                                    }

                                    // Update product data
                                    if (productData.id) {
                                      const { id, ...productUpdateData } =
                                        productData;
                                      await updateData(
                                        "Inventory/Storage/Products",
                                        productData.id,
                                        productUpdateData
                                      );
                                    }

                                    successCount++;
                                  } catch (error) {
                                    console.error(
                                      "Error importing stock:",
                                      error
                                    );
                                    errorCount++;
                                  }
                                }

                                if (successCount > 0) {
                                  toast.success(
                                    `Successfully imported ${successCount} stock entries`
                                  );
                                  setOnRefresh(true);
                                  onClose();
                                }
                                if (errorCount > 0) {
                                  toast.error(
                                    `Failed to import ${errorCount} stock entries`
                                  );
                                }
                              } catch (error: any) {
                                toast.error(`Import failed: ${error.message}`);
                              } finally {
                                setIsImporting(false);
                                e.target.value = "";
                              }
                            }
                          }}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Or add stock out manually:
                    </p>
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
                  </div>
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
  const openInvoiceModal = useCallback(() => {
    setModalRender("addInvoice");
    onOpen();
  }, [onOpen]);

  const openImportInvoiceModal = useCallback(() => {
    setModalRender("importInvoice");
    onOpen();
  }, [onOpen]);

  const parseStockInExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert Excel data to JSON
          const rawData = XLSX.utils.sheet_to_json(worksheet);

          if (rawData.length === 0) {
            reject(new Error("Excel file is empty"));
            return;
          }

          // Map Excel columns to StockIn data
          const importData = rawData.map((row: any, index: number) => {
            const stockIn = {
              location: String(row["Location"] ?? "").trim(),
              idProduct: String(row["Product ID"] ?? "").trim(),
              // nameProduct: String(row["Product Name"] ?? "").trim(),
              stockProduct: Number(row["Quantity"] ?? 0),
              invoiceId: String(row["Invoice Number"] ?? "").trim(),
              PIC: String(row["PIC"] ?? "").trim(),
              OrderData: new Date(row["Order Date"] ?? new Date()).valueOf(),
              ArrivalData: new Date(
                row["Arrival Date"] ?? new Date()
              ).valueOf(),
              statusProduct: String(row["Status"] ?? "Ordered").trim(),
              note: String(row["Notes"] ?? "").trim(),
              price: Number(row["Price"] ?? 0),
            };

            // Validate required fields
            if (
              !stockIn.idProduct ||
              !stockIn.location ||
              !stockIn.stockProduct ||
              !stockIn.invoiceId
            ) {
              console.warn(
                `Row ${
                  index + 2
                }: Missing required fields (Product ID, Location, Quantity, or Invoice Number)`,
                row
              );
            }

            return stockIn;
          });

          // Filter out invalid rows
          const validatedData = importData.filter(
            (row) =>
              row.idProduct && row.location && row.stockProduct && row.invoiceId
          );

          if (validatedData.length === 0) {
            reject(
              new Error(
                "No valid data found in Excel file. Please ensure all rows have Product ID, Location, Quantity, and Invoice Number."
              )
            );
            return;
          }

          resolve(validatedData);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Excel file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = (error) => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseStockOutExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert Excel data to JSON
          const rawData = XLSX.utils.sheet_to_json(worksheet);

          if (rawData.length === 0) {
            reject(new Error("Excel file is empty"));
            return;
          }

          // Map Excel columns to StockOut data
          const importData = rawData.map((row: any, index: number) => {
            const stockOut = {
              location: String(row["Location"] ?? "").trim(),
              category: String(row["Category"] ?? "").trim(),
              idProduct: String(row["Product ID"] ?? "").trim(),
              platform: String(row["Platform"] ?? "").trim(),
              stockProduct: Number(row["Quantity"] ?? 0),
              PIC: String(row["PIC"] ?? "").trim(),
              OrderData: new Date(row["Order Date"] ?? new Date()).valueOf(),
              ArrivalData: new Date(
                row["Arrival Date"] ?? new Date()
              ).valueOf(),
              price: Number(row["Price"] ?? 0),
              note: String(row["Notes"] ?? "").trim(),
            };

            // Validate required fields
            if (
              !stockOut.idProduct ||
              !stockOut.location ||
              !stockOut.stockProduct ||
              !stockOut.category
            ) {
              console.warn(
                `Row ${
                  index + 2
                }: Missing required fields (Product ID, Location, Quantity, or Category)`,
                row
              );
            }

            return stockOut;
          });

          // Filter out invalid rows
          const validatedData = importData.filter(
            (row) =>
              row.idProduct && row.location && row.stockProduct && row.category
          );

          if (validatedData.length === 0) {
            reject(
              new Error(
                "No valid data found in Excel file. Please ensure all rows have Product ID, Location, Quantity, and Category."
              )
            );
            return;
          }

          resolve(validatedData);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Excel file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = (error) => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseInvoiceExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert Excel data to JSON
          const rawData = XLSX.utils.sheet_to_json(worksheet);

          if (rawData.length === 0) {
            reject(new Error("Excel file is empty"));
            return;
          }

          // Map Excel columns to Invoice data
          const importData = rawData.map((row: any, index: number) => {
            const invoice = {
              invoiceNumber: String(
                row["Invoice Number"] ?? row.invoiceNumber ?? ""
              ).trim(),
              invoiceDate: String(
                row["Invoice Date"] ?? row.invoiceDate ?? ""
              ).trim(),
              supplier: String(row["Supplier"] ?? row.supplier ?? "").trim(),
              quantity: Number(row["Quantity"] ?? row.quantity ?? 0),
              unit: String(row["Unit"] ?? row.unit ?? "").trim(),
              subTotal: Number(row["Sub Total"] ?? row.subTotal ?? 0),
              shippingFee: Number(row["Shipping Fee"] ?? row.shippingFee ?? 0),
              totalInvoice: Number(
                row["Total Invoice"] ?? row.totalInvoice ?? 0
              ),
              currency: String(row["Currency"] ?? row.currency ?? "IDR").trim(),
              status: String(row["Status"] ?? row.status ?? "Active").trim(),
              notes: String(row["Notes"] ?? row.notes ?? "").trim(),
              location: String(row["Location"] ?? row.location ?? "").trim(),
              PIC: String(row["PIC"] ?? row.PIC ?? "").trim(),
            };

            // Validate required fields for each row
            if (
              !invoice.invoiceNumber ||
              !invoice.supplier ||
              !invoice.quantity ||
              !invoice.totalInvoice
            ) {
              console.warn(
                `Row ${
                  index + 2
                }: Missing required fields (Invoice Number, Supplier, Quantity, or Total Invoice)`,
                row
              );
            }

            return invoice;
          });

          // Filter out invalid rows
          const validatedData = importData.filter(
            (row) =>
              row.invoiceNumber &&
              row.supplier &&
              row.quantity &&
              row.totalInvoice
          );

          if (validatedData.length === 0) {
            reject(
              new Error(
                "No valid data found in Excel file. Please ensure all rows have Invoice Number, Supplier, Quantity, and Total Invoice."
              )
            );
            return;
          }

          if (validatedData.length < importData.length) {
            console.warn(
              `${
                importData.length - validatedData.length
              } rows were skipped due to missing required fields`
            );
          }

          resolve(validatedData);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse Excel file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = (error) => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const downloadStockInTemplate = useCallback(() => {
    const templateData = [
      {
        Location: "Jakarta",
        "Product ID": "PROD001",
        Quantity: 100,
        "Invoice Number": "INV001",
        PIC: "John Doe",
        "Order Date": "2024-01-15",
        "Arrival Date": "2024-01-20",
        Status: "Ordered",
        Notes: "Sample stock in notes",
        Price: 50000,
      },
      {
        Location: "Singapore",
        "Product ID": "PROD002",
        Quantity: 50,
        "Invoice Number": "INV002",
        PIC: "Jane Smith",
        "Order Date": "2024-01-16",
        "Arrival Date": "2024-01-21",
        Status: "Approved",
        Notes: "Sample stock in notes 2",
        Price: 75,
      },
    ];

    const instructions = [
      {
        Field: "Location",
        Required: "Yes",
        Description: "Storage location (Jakarta/Singapore)",
        Example: "Jakarta",
      },
      {
        Field: "Product ID",
        Required: "Yes",
        Description: "Product identifier (must match existing products)",
        Example: "PROD001",
      },
      {
        Field: "Product Name",
        Required: "Yes",
        Description: "Product name (must match existing products)",
        Example: "Sample Product",
      },
      {
        Field: "Quantity",
        Required: "Yes",
        Description: "Stock quantity to add",
        Example: "100",
      },
      {
        Field: "Invoice Number",
        Required: "Yes",
        Description: "Related invoice number",
        Example: "INV001",
      },
      {
        Field: "PIC",
        Required: "Yes",
        Description: "Person in charge",
        Example: "John Doe",
      },
      {
        Field: "Order Date",
        Required: "Yes",
        Description: "Order date (YYYY-MM-DD)",
        Example: "2024-01-15",
      },
      {
        Field: "Arrival Date",
        Required: "Yes",
        Description: "Arrival date (YYYY-MM-DD)",
        Example: "2024-01-20",
      },
      {
        Field: "Status",
        Required: "Yes",
        Description: "Status (Ordered, Approved, On Delivery, Received)",
        Example: "Ordered",
      },
      {
        Field: "Notes",
        Required: "No",
        Description: "Additional notes",
        Example: "Special instructions",
      },
      {
        Field: "Price",
        Required: "Yes",
        Description: "Unit price",
        Example: "50000",
      },
    ];

    try {
      const workbook = XLSX.utils.book_new();

      const templateSheet = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(workbook, templateSheet, "StockIn Template");

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

      XLSX.writeFile(workbook, "stockin_import_template.xlsx");
      toast.success("StockIn template downloaded successfully!");
    } catch (error) {
      console.error("Error creating StockIn template:", error);
      toast.error("Failed to download template");
    }
  }, []);

  const downloadStockOutTemplate = useCallback(() => {
    const templateData = [
      {
        Location: "Jakarta",
        Category: "Sales",
        "Product ID": "PROD001",
        Platform: "Shopee",
        Quantity: 10,
        PIC: "John Doe",
        "Order Date": "2024-01-15",
        "Arrival Date": "2024-01-20",
        Price: 50000,
        Notes: "Sample stock out notes",
      },
      {
        Location: "Singapore",
        Category: "Marketing",
        "Product ID": "PROD002",
        Platform: "Lazada",
        Quantity: 5,
        PIC: "Jane Smith",
        "Order Date": "2024-01-16",
        "Arrival Date": "2024-01-21",
        Price: 75,
        Notes: "Sample stock out notes 2",
      },
    ];

    const instructions = [
      {
        Field: "Location",
        Required: "Yes",
        Description: "Storage location (Jakarta/Singapore)",
        Example: "Jakarta",
      },
      {
        Field: "Category",
        Required: "Yes",
        Description: "Category (must match existing categories)",
        Example: "Sales",
      },
      {
        Field: "Product ID",
        Required: "Yes",
        Description: "Product identifier (must match existing products)",
        Example: "PROD001",
      },
      {
        Field: "Platform",
        Required: "Yes",
        Description: "Platform store (must match existing platforms)",
        Example: "Shopee",
      },
      {
        Field: "Quantity",
        Required: "Yes",
        Description: "Stock quantity to remove",
        Example: "10",
      },
      {
        Field: "PIC",
        Required: "Yes",
        Description: "Person in charge",
        Example: "John Doe",
      },
      {
        Field: "Order Date",
        Required: "Yes",
        Description: "Order date (YYYY-MM-DD)",
        Example: "2024-01-15",
      },
      {
        Field: "Arrival Date",
        Required: "Yes",
        Description: "Arrival date (YYYY-MM-DD)",
        Example: "2024-01-20",
      },
      {
        Field: "Price",
        Required: "Yes",
        Description: "Unit price",
        Example: "50000",
      },
      {
        Field: "Notes",
        Required: "No",
        Description: "Additional notes",
        Example: "Special instructions",
      },
    ];

    try {
      const workbook = XLSX.utils.book_new();

      const templateSheet = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(
        workbook,
        templateSheet,
        "StockOut Template"
      );

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

      XLSX.writeFile(workbook, "stockout_import_template.xlsx");
      toast.success("StockOut template downloaded successfully!");
    } catch (error) {
      console.error("Error creating StockOut template:", error);
      toast.error("Failed to download template");
    }
  }, []);

  const downloadInvoiceTemplate = useCallback(() => {
    const templateData = [
      {
        "Invoice Number": "INV001",
        "Invoice Date": "2024-01-15",
        Supplier: "Sample Supplier 1",
        Quantity: 10,
        Unit: "pcs",
        "Sub Total": 1000,
        "Shipping Fee": 100,
        "Total Invoice": 1100,
        Currency: "IDR",
        Status: "Active",
        Notes: "Sample invoice notes",
        Location: "Jakarta",
        PIC: "John Doe",
      },
      {
        "Invoice Number": "INV002",
        "Invoice Date": "2024-01-20",
        Supplier: "Sample Supplier 2",
        Quantity: 5,
        Unit: "box",
        "Sub Total": 500,
        "Shipping Fee": 50,
        "Total Invoice": 550,
        Currency: "SGD",
        Status: "Pending",
        Notes: "Sample invoice notes 2",
        Location: "Singapore",
        PIC: "Jane Smith",
      },
    ];

    const instructions = [
      {
        Field: "Invoice Number",
        Required: "Yes",
        Description: "Unique invoice identifier",
        Example: "INV001",
      },
      {
        Field: "Invoice Date",
        Required: "Yes",
        Description: "Invoice date (YYYY-MM-DD format)",
        Example: "2024-01-15",
      },
      {
        Field: "Supplier",
        Required: "Yes",
        Description: "Supplier name (must match existing clients)",
        Example: "ABC Company",
      },
      {
        Field: "Quantity",
        Required: "Yes",
        Description: "Quantity of items",
        Example: "10",
      },
      {
        Field: "Unit",
        Required: "Yes",
        Description: "Unit of measurement",
        Example: "pcs, box, kg",
      },
      {
        Field: "Sub Total",
        Required: "Yes",
        Description: "Subtotal amount",
        Example: "1000",
      },
      {
        Field: "Shipping Fee",
        Required: "No",
        Description: "Shipping cost",
        Example: "100",
      },
      {
        Field: "Total Invoice",
        Required: "Yes",
        Description: "Total invoice amount",
        Example: "1100",
      },
      {
        Field: "Currency",
        Required: "Yes",
        Description: "Currency (IDR or SGD)",
        Example: "IDR",
      },
      {
        Field: "Status",
        Required: "Yes",
        Description: "Invoice status (Active, Pending, Completed, Cancelled)",
        Example: "Active",
      },
      {
        Field: "Notes",
        Required: "No",
        Description: "Additional notes",
        Example: "Special instructions",
      },
      {
        Field: "Location",
        Required: "Yes",
        Description: "Location",
        Example: "Jakarta",
      },
      {
        Field: "PIC",
        Required: "Yes",
        Description: "Person in charge",
        Example: "John Doe",
      },
    ];

    try {
      const workbook = XLSX.utils.book_new();

      const templateSheet = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(workbook, templateSheet, "Invoice Template");

      const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

      XLSX.writeFile(workbook, "invoice_import_template.xlsx");
      toast.success("Invoice template downloaded successfully!");
    } catch (error) {
      console.error("Error creating invoice template:", error);
      toast.error("Failed to download template");
    }
  }, []);
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
    await getDataProducts();
    await getDataPIC();
    await getDataCategory();
    await getDataPlatform();
    await getDataStockout();
    await getDataStockin();
    await getDataInvoices();
    console.log("first render");
    setOnRefresh(false);
  }, [
    getDataCategory,
    getDataClient,
    getDataPIC,
    getDataPlatform,
    getDataProducts,
    getDataStockin,
    getDataStockout,
    getDataInvoices,
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
      Invoice: product.invoiceId,
      Status: product.statusProduct,
      Note: product.note,
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
            {/* <Button
              color="secondary"
              endContent={<RiFileExcel2Fill />}
              onPress={downloadStockInTemplate}
            >
              StockIn Template
            </Button>
            <Button
              color="secondary"
              endContent={<RiFileExcel2Fill />}
              onPress={downloadStockOutTemplate}
            >
              StockOut Template
            </Button> */}
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
    downloadStockInTemplate,
    downloadStockOutTemplate,
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
        <div className="flex items-center gap-2">
          <Button
            color="primary"
            endContent={<RiFileExcel2Fill />}
            onPress={exportExcel}
          >
            Export Product
          </Button>
          <Button color="secondary" onPress={openInvoiceModal} className="ml-4">
            Add Invoice
          </Button>
          <Button
            color="primary"
            onPress={openImportInvoiceModal}
            endContent={<RiFileExcel2Fill />}
            className="ml-4"
          >
            Import Invoice
          </Button>
          <span className="text-small text-default-400 hidden md:flex">
            {selectedKeys === "all"
              ? "All items selected"
              : `${selectedKeys.size} of ${items.length} selected`}
          </span>
        </div>
      </div>
    );
  }, [
    hasSearchFilter,
    page,
    pages,
    exportExcel,
    openInvoiceModal,
    openImportInvoiceModal,
    selectedKeys,
    items.length,
  ]);

  type propsBody = {
    item: StockType;
    columnKey: string;
    onDetail?: (items: StockType) => void;
    onBarcode?: (items: StockType) => void;
    onEdit?: (items: StockType) => void;
    onDelete?: (items: StockType) => void;
  };
  const renderBody = useCallback(
    ({ item, columnKey, onDetail, onEdit, onDelete, onBarcode }: propsBody) => {
      if (!item) return null;

      const cellValue = item[columnKey as keyof StockType];

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
    },
    []
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
                      columnKey: String(columnKey),
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
