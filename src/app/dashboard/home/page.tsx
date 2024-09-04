"use client";
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
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { users } from "./data";
import getDataCollection from "@/components/firebase/getDataCollection";
import { toast } from "sonner";
import createData from "@/components/firebase/createData";
const INITIAL_VISIBLE_COLUMNS = ["name", "role", "status", "actions"];

type User = (typeof users)[0];

export default function HomeDashboard() {
  const [filterValue, setFilterValue] = useState("");
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [product, setProduct] = useState<{
    idProduct: string;
    nameProduct: string;
    type: string;
    stock: number;
    description: string;
    notes: string;
    image: string;
    status: "Available" | "Not Available" | "Out Of Stock";
  }>({
    idProduct: "",
    nameProduct: "",
    type: "",
    stock: 0,
    description: "",
    notes: "",
    image: "",
    status: "Available",
  });

  const statusOptions = useMemo(
    () => [
      { name: "Active", uid: "active" },
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
      { name: "ID", uid: "id", sortable: true },
      { name: "NAME", uid: "name", sortable: true },
      { name: "AGE", uid: "age", sortable: true },
      { name: "ROLE", uid: "role", sortable: true },
      { name: "TEAM", uid: "team" },
      { name: "EMAIL", uid: "email" },
      { name: "STATUS", uid: "status", sortable: true },
      { name: "ACTIONS", uid: "actions" },
    ],
    []
  );
  const [type, setType] = useState<[{ id: string; type: string }]>();

  const getDataType = useCallback(async () => {
    const { result, error } = await getDataCollection(`Inventory/Admin/Type`);
    if (!error) {
      setType(result);
    } else {
      return toast("ERROR, Please Try Again !");
    }
  }, []);

  useEffect(() => {
    getDataType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
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
  }, [hasSearchFilter, statusFilter, statusOptions.length, filterValue]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User] as number;
      const second = b[sortDescriptor.column as keyof User] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

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
    // setchooseUser(item);
    setModalRender("delete");
    onOpen();
  }
  const openAddModal = useCallback(() => {
    setModalRender("Add");
    onOpen();
  }, [onOpen]);
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
            <Dropdown>
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
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
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
                  <DropdownItem key={column.uid} className="capitalize">
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
            Total users.length users
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    statusFilter,
    statusOptions,
    visibleColumns,
    columns,
    openAddModal,
    onRowsPerPageChange,
    onClear,
  ]);

  const addProductStorage = useCallback(async () => {
    const { result, error } = await createData(
      `Inventory/Storage/Products`,
      product
    );
    if (!error) {
      console.log("result berhasil");
    }
  }, [product]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProduct((prev) => {
      return { ...prev, type: e.target.value };
    });
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
    } else {
      return (
        <>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement="top-center"
            className="max-w-[100vw]"
          >
            <ModalContent>
              {(onClose: any) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 bg-toscadb text-white">
                    Add Product
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      className="w-70v"
                      classNames={{
                        innerWrapper: "w-[100%]",
                        inputWrapper: "w-[100%]",
                      }}
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
                      label="Product Name"
                      className="w-70v"
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
                      classNames={{
                        innerWrapper: "w-[100%]  ",
                        inputWrapper: "w-[100%]",
                      }}
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
                    <Select
                      items={type}
                      label="Type Product"
                      placeholder="Select an Type"
                      className="w-70v"
                      selectedKeys={[product.type]}
                      classNames={{
                        innerWrapper: "w-[100%]",
                        listboxWrapper: "w-[100%]",
                        base: "w-[100%]",
                        mainWrapper: "w-[100%]",
                        trigger: "w-[100%]",
                        popoverContent: "w-[100%]",
                      }}
                      onChange={handleSelectionChange}
                    >
                      {(types) => (
                        <SelectItem key={types?.type}>{types?.type}</SelectItem>
                      )}
                    </Select>
                    {/* <Input
                      label="Stock"
                      className="w-70v"
                      labelPlacement="outside"
                      type="text"
                      inputMode="numeric"
                      variant="bordered"
                      value={stock.toString()}
                      onValueChange={(data) => setStock(Number(data))}
                      classNames={{
                        innerWrapper: "w-[100%]  ",
                        inputWrapper: "w-[100%]",
                      }}
                    /> */}
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
                      onPress={addProductStorage}
                      className="bg-greenbt text-white"
                    >
                      Add Product
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

  return (
    <div className="flex justify-center items-center">
      {renderModal()}
      <Table
        isHeaderSticky
        topContent={topContent}
        topContentPlacement="outside"
        className="w-80v"
        classNames={{ wrapper: "w-[100%] " }}
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
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>test</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
