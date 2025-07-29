"use client";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
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
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FaCheck, FaSearch } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { users } from "./data";
import getDataCollection from "@/components/firebase/getDataCollection";
import { toast } from "sonner";
import createData from "@/components/firebase/createData";
import { BsCheckLg } from "react-icons/bs";
import { IoMdBarcode, IoMdEye } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import updateData from "@/components/firebase/updateData";
import CurrencyInput from "react-currency-input-field";
import html2canvas from "html2canvas";
import { ReactBarcode } from "react-jsbarcode";
import { useFilePicker } from "use-file-picker";
import uploadFoto from "@/components/firebase/uploadFoto";
import { RiFileExcel2Fill } from "react-icons/ri";
import { onGetExporProduct } from "@/components/export/exportExcel";
import { parseExcelFile } from "@/components/export/importExcel";
import { downloadExcelTemplate } from "@/components/export/createTemplate";
import { renderType } from "@/components/function/product";

const INITIAL_VISIBLE_COLUMNS = ["idProduct", "type", "status", "actions"];

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

type ProductItem = {
  idProduct: string;
  nameProduct: string;
  inventoryName: string;
  type: string;
  stock_id: number;
  stock_sg: number;
  description: string;
  priceSG: string | number;
  priceID: string | number;
  notes: string;
  inventory_image: string;
  status: "Available" | "Not Available" | "Out Of Stock";
  certificate: boolean;
};

type ImportProduct = {
  idProduct: string;
  nameProduct: string;
  type: string;
  description: string;
  priceSG: string | number;
  priceID: string | number;
  notes: string;
  certificate: boolean;
};

export default function HomeDashboard() {
  const [onRefresh, setOnRefresh] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "idProduct",
    direction: "ascending",
  });
  const [selectedKeys, setSelectedKeys] = React.useState<any>(new Set([]));
  const [selectedItem, setselectedItem] = useState<any>();
  const [product, setProduct] = useState<ProductItem>({
    idProduct: "",
    nameProduct: "",
    inventoryName: "",
    type: "",
    stock_id: 0,
    stock_sg: 0,
    description: "",
    priceSG: "",
    priceID: "",
    notes: "",
    inventory_image: "",
    status: "Available",
    certificate: false,
  });
  const [importProduct, setImportProduct] = useState<ImportProduct>({
    idProduct: "",
    nameProduct: "",
    type: "",
    description: "",
    priceSG: "",
    priceID: "",
    notes: "",
    certificate: false,
  });

  const { openFilePicker, filesContent, plainFiles, clear } = useFilePicker({
    readAs: "DataURL",
    accept: "image/*",
    multiple: false,
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      // console.log("onFilesRejected", errors);
      toast.error(`Add Image Rejected ${errors}`);
    },
    onFilesSuccessfullySelected: ({ plainFiles }) => {
      // this callback is called when there were no validation errors
      // console.log("onFilesSuccessfullySelected", plainFiles, filesContent);
      toast.success(`Add Image ${plainFiles[0].name} successful!`);
    },
  });

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
      { name: "ID", uid: "idProduct", sortable: true },
      { name: "NAME", uid: "inventoryName", sortable: true },
      { name: "TYPE", uid: "type", sortable: true },
      { name: "All Stock", uid: "AllStock" },
      { name: "Singapore Stock", uid: "StockSG", sortable: true },
      { name: "Indonesia Stock", uid: "StockIDN", sortable: true },
      { name: "STATUS", uid: "status", sortable: true },
      { name: "ACTIONS", uid: "actions" },
    ],
    []
  );
  const [type, setType] = useState<[{ id: string; type: string }]>([
    { id: "1", type: "Electronics" },
  ]);
  const [defaultProduct, setDefaultProduct] = useState<any>();
  const [location, setlocation] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

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
      setDefaultProduct(result);
      // result.forEach(async (item: any) => {
      //   const data = {
      //     ...item,
      //     stock_sg:0,
      //     stock_id:0,
      //   };
      //   delete data.nomor;
      //   delete data.id;
      //   const { result, error } = await updateData(
      //     `Inventory/Storage/Products`,
      //     item.id,
      //     data
      //   );
      //   if (error) {
      //     console.error("Error updating product:", error);
      //   } else {
      //     console.log("Product updated successfully:", result);
      //   }
      // });
    } else {
      return toast("ERROR, Please Try Again !");
    }
  }, []);
  useEffect(() => {
    if (onRefresh) {
      getDataType();
      getDataProducts();
    }
    setOnRefresh(false);
  }, [getDataProducts, getDataType, onRefresh]);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...(defaultProduct ?? [{}])];

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
    defaultProduct,
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
        const first = a[
          (sortDescriptor.column === "StockIDN"
            ? "stock_id"
            : sortDescriptor.column === "StockStockSGDN"
            ? "stock_sg"
            : sortDescriptor.column) as keyof ProductType
        ] as number;
        const second = b[
          (sortDescriptor.column === "StockIDN"
            ? "stock_id"
            : sortDescriptor.column === "StockStockSGDN"
            ? "stock_sg"
            : sortDescriptor.column) as keyof ProductType
        ] as number;
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
  function openDelete(item: any) {
    setselectedItem(item);
    setModalRender("delete");
    onOpen();
  }
  function openDetail(item: any) {
    setselectedItem(item);
    setModalRender("detail");
    onOpen();
  }
  function openBarcode(item: any) {
    setselectedItem(item);
    setModalRender("barcode");
    onOpen();
  }
  function openEdit(item: any) {
    setselectedItem(item);
    setModalRender("edit");
    onOpen();
  }
  const openAddModal = useCallback(() => {
    setModalRender("Add");
    onOpen();
  }, [onOpen]);
  const openImportModal = useCallback(() => {
    setModalRender("Import");
    onOpen();
  }, [onOpen]);

  const exportExcel = useCallback(async () => {
    const dataToExport = defaultProduct.map((product: ProductItem) => ({
      ID: product.idProduct,
      "Product Name": product.nameProduct,
      "Indonesia Stock": product.stock_id,
      "Singapore Stock": product.stock_sg,
      "Indonesia Price": product.priceID,
      "Singapore Price": product.priceSG,
      "Product Type": product.type,
      Description: product.description,
    }));
    await onGetExporProduct("Inventory Website", "Batch 1", dataToExport);
  }, [defaultProduct]);
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
            <Button
              color="primary"
              endContent={<RiFileExcel2Fill />}
              onPress={openImportModal}
            >
              Import Product
            </Button>
            <Button
              color="primary"
              endContent={<RiFileExcel2Fill />}
              onPress={exportExcel}
            >
              Export Product
            </Button>
            <Dropdown classNames={{ content: "w-50v data-[open=true]:bg-red" }}>
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
            </Dropdown>
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
              onPress={openAddModal}
            >
              Add New
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
    openImportModal,
    exportExcel,
    statusFilter,
    statusOptions,
    visibleColumns,
    columns,
    openAddModal,
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
          // isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400 hidden md:flex">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    );
  }, [page, pages, selectedKeys, items.length]);

  const addProductStorage = useCallback(async () => {
    let find = defaultProduct.find(
      (data: any) => data.idProduct === product.idProduct
    );
    if (find) {
      return toast.warning("Product Already Exist");
    }
    if (filesContent.length > 0) {
      const { result, error } = await uploadFoto(
        "InventoryProduct",
        `inventory-${plainFiles[0].name}`,
        filesContent[0].content
      );
      if (error) {
        console.log("error upload picture", error);
      }
      const link_photo = result;
      if (link_photo) {
        const data = { ...product };
        data.priceSG = Number(data.priceSG);
        data.priceID = Number(data.priceID);
        data.inventory_image = link_photo;

        const { error } = await createData(`Inventory/Storage/Products`, data);
        if (!error) {
          toast.success("Add Product successful!");
          setOnRefresh(true);

          // setProduct((prev) => {
          //   return { ...prev, idProduct: "" };
          // });
        }
      }
    } else {
      const data = { ...product };
      data.priceSG = Number(data.priceSG);
      data.priceID = Number(data.priceID);
      data.inventory_image = "";
      data.inventoryName = data.nameProduct;
      // console.log("data", data);
      // return;
      const { result, error } = await createData(
        `Inventory/Storage/Products`,
        data
      );
      if (!error) {
        toast.success("Add Product successful!");
        setOnRefresh(true);

        // setProduct((prev) => {
        //   return { ...prev, idProduct: "" };
        // });
      }
    }
  }, [defaultProduct, filesContent, plainFiles, product]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProduct((prev) => {
      return { ...prev, type: e.target.value };
    });
  };
  const handleSelectionChangeEdit = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setselectedItem((prev: any) => {
      return { ...prev, type: e.target.value };
    });
  };

  const deleteProduct = useCallback(async (datas: any) => {
    let data = { ...datas };
    let id = data.id;
    delete data.id;
    delete data.nomor;
    data.visible = false;
    const { result, error } = await updateData(
      "Inventory/Storage/Products",
      id,
      data
    );
    if (!error) {
      toast.success("Delete Product successful!");
      setOnRefresh(true);
    } else {
      toast.error("Delete Product failed!");
    }
  }, []);
  const updateProduct = useCallback(
    async (datas: any) => {
      if (plainFiles?.length > 0) {
        const { result, error } = await uploadFoto(
          "InventoryProduct",
          `inventory-${plainFiles[0].name}`,
          filesContent[0].content
        );
        if (error) {
          console.log("error upload picture", error);
        }
        const link_photo = result;
        if (link_photo) {
          let data = { ...datas };
          let id = data.id;
          delete data.id;
          delete data.nomor;
          data.priceSG = Number(data.priceSG);
          data.priceID = Number(data.priceID);
          data.image = link_photo;
          const { result, error } = await updateData(
            "Inventory/Storage/Products",
            id,
            data
          );
          if (!error) {
            toast.success("Update Product successful!");
          } else {
            toast.error("Update Product failed!");
          }
        }
      } else {
        let data = { ...datas };
        let id = data.id;
        delete data.id;
        delete data.nomor;
        data.priceSG = Number(data.priceSG);
        data.priceID = Number(data.priceID);
        const { result, error } = await updateData(
          "Inventory/Storage/Products",
          id,
          data
        );
        if (!error) {
          toast.success("Update Product successful!");
        } else {
          toast.error("Update Product failed!");
        }
      }
      setOnRefresh(true);
      onClose();
      clear();
    },
    [clear, filesContent, onClose, plainFiles]
  );

  const handleDownloadBarcode = async (item: any) => {
    const element = document.getElementById("printbarcode")!,
      canvas = await html2canvas(element),
      data = canvas.toDataURL("image/jpg"),
      link = document.createElement("a");

    link.href = data;
    link.download = `barcode-${item?.idProduct}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  function renderModal() {
    if (modal === "detail") {
      return (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
          classNames={{ base: "light text-black max-w-fit" }}
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose: any) => (
              <>
                <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                  Detail Products
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-3 ">
                    <p>ID Product</p>
                    <p className="col-span-2">: {selectedItem?.idProduct}</p>
                  </div>
                  <div className="grid grid-cols-3">
                    <p>Name Product</p>
                    <p className="col-span-2">
                      : {selectedItem?.inventoryName}
                    </p>
                  </div>
                  <div className="grid grid-cols-3">
                    <p>Type Product</p>
                    <p className="col-span-2">: {selectedItem?.type}</p>
                  </div>
                  <div className="grid grid-cols-3">
                    <p>Price SG Product</p>
                    <p className="col-span-2">
                      :
                      <CurrencyInput
                        readOnly
                        intlConfig={{ locale: "en-SG", currency: "SGD" }}
                        defaultValue={0}
                        decimalsLimit={2}
                        value={
                          selectedItem?.priceSG ? selectedItem?.priceSG : 0
                        }
                      />
                    </p>
                  </div>
                  <div className="grid grid-cols-3">
                    <p>Price ID Product</p>
                    <p className="col-span-2">
                      :
                      <CurrencyInput
                        readOnly
                        intlConfig={{ locale: "id-ID", currency: "IDR" }}
                        value={
                          selectedItem?.priceID ? selectedItem?.priceID : 0
                        }
                      />
                    </p>
                  </div>
                  <div className="grid grid-cols-3 ">
                    <p>Stock SG Product</p>
                    <p className="col-span-2">
                      : {selectedItem?.stock_sg ? selectedItem?.stock_sg : 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 ">
                    <p>Stock ID Product</p>
                    <p className="col-span-2">
                      : {selectedItem?.stock_id ? selectedItem?.stock_id : 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-3">
                    <p>Description Product &emsp; </p>{" "}
                    <div className="col-span-2">
                      <Textarea isReadOnly value={selectedItem?.description} />
                    </div>
                  </div>
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
                  Delete Products
                </ModalHeader>
                <ModalBody>
                  <p>{`Are you sure delete data ${selectedItem?.idProduct} ${selectedItem?.nameProduct} ?`}</p>
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
                    onPress={() => deleteProduct(selectedItem)}
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
    } else if (modal === "edit") {
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
                  Edit Product
                </ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    autoFocus
                    label="ID Product"
                    labelPlacement="outside"
                    type="text"
                    variant="bordered"
                    value={selectedItem?.idProduct}
                    onValueChange={(datas) =>
                      setselectedItem((prev: any) => {
                        return { ...prev, idProduct: datas };
                      })
                    }
                  />
                  <Input
                    isRequired
                    label="Product Name"
                    labelPlacement="outside"
                    type="text"
                    inputMode="numeric"
                    variant="bordered"
                    value={selectedItem?.nameProduct}
                    onValueChange={(datas) =>
                      setselectedItem((prev: any) => {
                        return { ...prev, nameProduct: datas };
                      })
                    }
                  />
                  <Select
                    isRequired
                    items={type}
                    label="Type Product"
                    placeholder="Select an Type"
                    selectedKeys={[selectedItem!.type]}
                    onChange={handleSelectionChangeEdit}
                  >
                    {(types) => (
                      <SelectItem key={types.id}>{types?.type}</SelectItem>
                    )}
                  </Select>
                  <h2>SG Price</h2>
                  <CurrencyInput
                    id="input-example"
                    name="Price"
                    intlConfig={{ locale: "en-SG", currency: "SGD" }}
                    placeholder="Please enter price"
                    defaultValue={0}
                    decimalsLimit={2}
                    allowDecimals={true}
                    step={1}
                    className="bg-gray-100 py-2 px-1 rounded-md"
                    // defaultValue={1000}
                    // // decimalsLimit={2}
                    value={selectedItem.priceSG}
                    onValueChange={(value, name, values) =>
                      setselectedItem((prev: any) => {
                        return {
                          ...prev,
                          priceSG: value !== undefined ? value : 0,
                        };
                      })
                    }
                  />
                  <h2>IND Price</h2>
                  <CurrencyInput
                    id="input-example"
                    name="Price"
                    intlConfig={{ locale: "id-ID", currency: "IDR" }}
                    placeholder="Please enter price"
                    className="bg-gray-100 py-2 px-1 rounded-md"
                    defaultValue={0}
                    decimalsLimit={2}
                    allowDecimals={true}
                    step={1}
                    // defaultValue={1000}
                    // // decimalsLimit={2}
                    value={selectedItem.priceID}
                    onValueChange={(value, name, values) =>
                      setselectedItem((prev: any) => {
                        return {
                          ...prev,
                          priceID: value !== undefined ? value : 0,
                        };
                      })
                    }
                  />
                  <div className="">
                    <h1>
                      Image<span className="text-red-500 ml-1">*</span>
                    </h1>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openFilePicker()}
                        fullWidth={true}
                        radius="sm"
                      >
                        {plainFiles?.length > 0
                          ? "Choose Again"
                          : "Choose File"}
                      </Button>
                      {plainFiles?.length > 0 && (
                        <Button
                          onClick={() => clear()}
                          fullWidth={true}
                          radius="sm"
                        >
                          Clear
                        </Button>
                      )}
                      {plainFiles?.length > 0 ? (
                        <>
                          {plainFiles?.map((file) => (
                            <div key={file.name}>{file.name}</div>
                          ))}
                        </>
                      ) : selectedItem.image !== "" ? (
                        <>
                          <Image
                            src={selectedItem.image}
                            width={300}
                            height={300}
                            alt="Image Banner"
                          />
                        </>
                      ) : null}
                    </div>
                  </div>
                  <Checkbox
                    isSelected={selectedItem.certificate}
                    onValueChange={(datas) =>
                      setselectedItem((prev: any) => {
                        return { ...prev, certificate: datas };
                      })
                    }
                    classNames={{ icon: "text-black bg-white" }}
                    icon={<FaCheck className="bg-black " />}
                    size="lg"
                  >
                    Certificate
                  </Checkbox>
                  <Textarea
                    // isRequired
                    label="Description"
                    labelPlacement="outside"
                    placeholder="Enter your description"
                    // className="max-w-xs"
                    value={selectedItem?.description}
                    onValueChange={(datas) =>
                      setselectedItem((prev: any) => {
                        return { ...prev, description: datas };
                      })
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={() => updateProduct(selectedItem)}
                    isDisabled={!selectedItem?.idProduct || !selectedItem?.type}
                    className="bg-greenbt text-white"
                  >
                    Edit Product
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    } else if (modal === "barcode") {
      return (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
          classNames={{
            base: "light text-black",
            wrapper: "min-h-fit",
            body: "min-h-fit",
          }}
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose: any) => (
              <>
                <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white min-w-fit min-h-fit">
                  Barcode
                </ModalHeader>
                <ModalBody className="flex flex-col jusitfy-center items-center">
                  <div
                    id="printbarcode"
                    className="max-w-fit flex flex-col items-center justify-center px-1"
                  >
                    <ReactBarcode
                      value={selectedItem?.idProduct}
                      // style={{alignItems:'center',alignSelf:'center'}}
                      // renderer="image"
                    />
                    <p>{selectedItem.nameProduct}</p>
                    {/* <Barcode
                        value={"131251231251"}
                        // textPosition="center"
												// displayValue={false}
                        format={selectedItem?.idProduct===12 ?"UPC":"UPC"}
                        textAlign="center"
                        // ean128={true}
                        renderer="img"
                      /> */}
                  </div>
                  {/* <p>{`Are you sure delete data ${selectedItem?.idProduct} ${selectedItem?.nameProduct} ?`}</p> */}
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={onClose}
                    className="bg-bluebt text-white"
                  >
                    Close
                  </Button>
                  <Button
                    variant="solid"
                    onPress={() => handleDownloadBarcode(selectedItem)}
                    className="bg-red-600 text-white"
                  >
                    Download
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    } else if (modal === "Import") {
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
                  Import Product
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        color="primary"
                        className="w-1/2"
                        onPress={() => downloadExcelTemplate(type)}
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
                          htmlFor="file-upload"
                          className="cursor-pointer w-full py-2 px-4"
                        >
                          {isImporting ? "Importing..." : "Choose Excel File"}
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsImporting(true);
                              try {
                                const file = e.target.files[0];
                                toast.info("Parsing Excel file...");
                                const importedData = await parseExcelFile(file);

                                toast.info(
                                  `Found ${importedData.length} products. Starting import...`
                                );

                                // Store imported data
                                let successCount = 0;
                                let skipCount = 0;
                                let errorCount = 0;

                                for (const item of importedData) {
                                  const newProduct = {
                                    ...item,
                                    status: "Available",
                                    stock_id: 0,
                                    stock_sg: 0,
                                    inventory_image: "",
                                    inventoryName: item.nameProduct,
                                  };

                                  // Check if product already exists
                                  const exists = defaultProduct.find(
                                    (p: any) => p.idProduct === item.idProduct
                                  );

                                  // Validate if product type exists in available types
                                  const typeExists = type?.find(
                                    (t: any) => t.type === item.type
                                  );

                                  if (!typeExists) {
                                    toast.error(
                                      `Product type "${item.type}" for product ${item.idProduct} does not exist in system`
                                    );
                                    errorCount++;
                                    continue;
                                  } else {
                                    newProduct.type = typeExists.id;
                                  }
                                  console.log("item", item.type);
                                  if (exists) {
                                    skipCount++;
                                    continue;
                                  }

                                  // Add default fields for new product

                                  try {
                                    await createData(
                                      "Inventory/Storage/Products",
                                      newProduct
                                    );
                                    successCount++;
                                  } catch (error) {
                                    console.error(
                                      "Error importing product:",
                                      error
                                    );
                                    errorCount++;
                                  }
                                }

                                // Show results
                                if (successCount > 0) {
                                  toast.success(
                                    `Successfully imported ${successCount} products`
                                  );
                                }
                                if (skipCount > 0) {
                                  toast.warning(
                                    `Skipped ${skipCount} existing products`
                                  );
                                }
                                if (errorCount > 0) {
                                  toast.error(
                                    `Failed to import ${errorCount} products`
                                  );
                                }

                                if (successCount > 0) {
                                  setOnRefresh(true);
                                  onClose();
                                }
                              } catch (error: any) {
                                toast.error(`Import failed: ${error.message}`);
                              } finally {
                                setIsImporting(false);
                                // Reset file input
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
                      Excel file should contain columns: ID/idProduct, Product
                      Name/nameProduct, Product Type/type,
                      Description/description, Singapore Price/priceSG,
                      Indonesia Price/priceID, Notes/notes,
                      Certificate/certificate
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
    } else {
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
                  Add Product
                </ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    autoFocus
                    label="ID Product"
                    labelPlacement="outside"
                    type="text"
                    variant="bordered"
                    value={product.idProduct}
                    onValueChange={(datas) =>
                      setProduct((prev) => {
                        return { ...prev, idProduct: datas };
                      })
                    }
                  />
                  <Input
                    isRequired
                    label="Product Name"
                    labelPlacement="outside"
                    type="text"
                    inputMode="numeric"
                    variant="bordered"
                    value={product.nameProduct}
                    onValueChange={(datas) =>
                      setProduct((prev) => {
                        return { ...prev, nameProduct: datas };
                      })
                    }
                  />
                  <Select
                    isRequired
                    items={type}
                    label="Type Product"
                    placeholder="Select an Type"
                    selectedKeys={[product.type]}
                    onChange={handleSelectionChange}
                  >
                    {(types) => (
                      <SelectItem key={types?.id}>{types?.type}</SelectItem>
                    )}
                  </Select>
                  <h2>SG Price</h2>
                  <CurrencyInput
                    id="input-example"
                    name="Price"
                    intlConfig={{ locale: "en-SG", currency: "SGD" }}
                    placeholder="Please enter price"
                    defaultValue={0}
                    decimalsLimit={2}
                    allowDecimals={true}
                    step={1}
                    className="bg-gray-100 py-2 px-1 rounded-md"
                    // defaultValue={1000}
                    // // decimalsLimit={2}
                    value={product.priceSG}
                    onValueChange={(value, name, values) =>
                      setProduct((prev) => {
                        return {
                          ...prev,
                          priceSG: value !== undefined ? value : 0,
                        };
                      })
                    }
                  />
                  <h2>IND Price</h2>
                  <CurrencyInput
                    id="input-example"
                    name="Price"
                    intlConfig={{ locale: "id-ID", currency: "IDR" }}
                    placeholder="Please enter price"
                    defaultValue={0}
                    className="bg-gray-100 py-2 px-1 rounded-md"
                    // defaultValue={1000}
                    // // decimalsLimit={2}
                    value={product.priceID}
                    onValueChange={(value, name, values) =>
                      setProduct((prev) => {
                        return {
                          ...prev,
                          priceID: Number(value !== undefined ? value : 0),
                        };
                      })
                    }
                  />

                  {/* <Input
                      label="Price"
                      className="w-70v"
                      labelPlacement="outside"
                      type="text"
                      inputMode="numeric"
                      variant="bordered"
                      value={currencyFormat(product.price)}
                      onValueChange={(datas) =>
                        setProduct((prev) => {
                          return { ...prev, price: Number(reverseFormatNumber(datas)) };
                        })
                      }
                    /> */}
                  <Checkbox
                    isSelected={product.certificate}
                    onValueChange={(datas) =>
                      setProduct((prev) => {
                        return { ...prev, certificate: datas };
                      })
                    }
                    classNames={{ icon: "text-black bg-white" }}
                    icon={<FaCheck className="bg-black " />}
                    size="lg"
                  >
                    Certificate
                  </Checkbox>
                  <div>
                    <h1>
                      Image<span className="text-red-500 ml-1">*</span>
                    </h1>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => openFilePicker()}
                        fullWidth={true}
                        radius="sm"
                      >
                        {plainFiles?.length > 0
                          ? "Choose Again"
                          : "Choose File"}
                      </Button>
                      {plainFiles?.length > 0 && (
                        <Button
                          onClick={() => clear()}
                          fullWidth={true}
                          radius="sm"
                        >
                          Clear
                        </Button>
                      )}
                      {plainFiles?.map((file) => (
                        <div key={file.name}>{file.name}</div>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    label="Description"
                    labelPlacement="outside"
                    placeholder="Enter your description"
                    // className="max-w-xs"
                    value={product.description}
                    onValueChange={(datas) =>
                      setProduct((prev) => {
                        return { ...prev, description: datas };
                      })
                    }
                  />
                  <Textarea
                    label="Notes"
                    labelPlacement="outside"
                    placeholder="Enter your Notes"
                    // className="max-w-xs"
                    value={product.notes}
                    onValueChange={(datas) =>
                      setProduct((prev) => {
                        return { ...prev, notes: datas };
                      })
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="flat"
                    onPress={addProductStorage}
                    isDisabled={!product.idProduct || !product.type}
                    className="bg-greenbt text-white"
                  >
                    Add Product
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      );
    }
  }

  type propsBody = {
    item: any;
    columnKey: any;
    onDetail: (items: any) => void;
    onBarcode: (items: any) => void;
    onEdit: (items: any) => void;
    onDelete: (items: any) => void;
  };
  const renderBody = useCallback(
    ({ item, columnKey, onDetail, onEdit, onDelete, onBarcode }: propsBody) => {
      const cellValue = item[columnKey];
      switch (columnKey) {
        case "AllStock":
          return <p>{(item?.stock_id ?? 0) + (item?.stock_sg ?? 0)}</p>;
        case "StockSG":
          return <p>{item?.stock_sg ?? 0}</p>;
        case "StockIDN":
          return <p>{item?.stock_id ?? 0}</p>;
        case "type":
          return <p>{renderType(type, item?.type)}</p>;
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Barcode">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => onBarcode(item)}
                >
                  <IoMdBarcode />
                </span>
              </Tooltip>
              <Tooltip content="Details">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => onDetail(item)}
                >
                  <IoMdEye />
                </span>
              </Tooltip>
              <Tooltip content="Edit user">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  onClick={() => onEdit(item)}
                >
                  <FaEdit />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete user">
                <span
                  className="text-lg text-danger cursor-pointer active:opacity-50"
                  onClick={() => onDelete(item)}
                >
                  <MdDeleteForever />
                </span>
              </Tooltip>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [type]
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
                      onDelete: (item) => openDelete(item),
                      onDetail: (item) => openDetail(item),
                      onBarcode: (item) => openBarcode(item),
                      onEdit: (item) => openEdit(item),
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
