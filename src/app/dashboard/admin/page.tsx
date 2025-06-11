"use client";
import createData from "@/components/firebase/createData";
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
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import React, { useState, useMemo, useCallback } from "react";
import { MdOutlinePersonAdd } from "react-icons/md";
import { toast } from "sonner";

export default function Admin() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [type, setType] = useState("");
  const [client, setClient] = useState("");
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");

  const pushDataType = useCallback(async () => {
    setLoading(true);
    if (modal === "Client") {
      const { result, error } = await createData(`Inventory/Admin/Client`, {
        Client: client,
      });
      if (!error) {
        setClient("");
        toast.success("Success, Add Client Success");
        console.log("Add Client Success");
      } else {
        toast.error("Error, Add Client Failed");
        console.log("Gagal ");
      }
    } else if (modal === "Add") {
      const { result, error } = await createData(`Inventory/Admin/Type`, {
        type: type,
        description: description,
      });
      if (!error) {
        setType("");
        setDescription("");
        toast.success("Success , Add Type Success");
      } else {
        toast.error("Add Type Failed");
        console.log("Add Client Failed");
      }
    } else if (modal === "PIC") {
      const { result, error } = await createData(`Inventory/Admin/PIC`, {
        name: staff,
      });
      if (!error) {
        setStaff("");
        toast.success("Success , Add PIC Success");
      } else {
        console.log("Add PIC Failed");
        toast.error("Failed Add PIC");
      }
    } else if (modal === "Category") {
      const { result, error } = await createData(
        `Inventory/Admin/CategoryProductOut`,
        {
          name: category,
        }
      );
      if (!error) {
        setCategory("");
        toast.success("Success , Add Category Product Out Success");
      } else {
        toast.error("Failed Add Category Product Out");
        console.log("Add Category Failed");
      }
    } else if (modal === "Platform") {
      const { result, error } = await createData(
        `Inventory/Admin/PlatformStore`,
        {
          name: platform,
        }
      );
      if (!error) {
        setPlatform("");
        toast.success("Success , Add Platform Store Success");
      } else {
        toast.error("Failed Add Platform Store");
        console.log("Add Platform Failed");
      }
    }
    setLoading(false);
  }, [category, client, description, modal, platform, staff, type]);

  const renderModal = useCallback(() => {
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
    } else if (modal === "Add") {
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
                    Add Type
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      classNames={{
                        innerWrapper: "w-[100%]",
                        inputWrapper: "w-[100%]",
                      }}
                      label="Type Product"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={type}
                      onValueChange={setType}
                    />
                    <Input
                      autoFocus
                      classNames={{
                        innerWrapper: "w-[100%]",
                        inputWrapper: "w-[100%]",
                      }}
                      label="Description Type"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={description}
                      onValueChange={setDescription}
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
                      onPress={pushDataType}
                      isDisabled={loading}
                      className="bg-greenbt text-white"
                    >
                      Add Type Product
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "Client") {
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
                    Add Client Product
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      label="Client Name"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={client}
                      onValueChange={setClient}
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
                      onPress={pushDataType}
                      isDisabled={loading}
                      className="bg-greenbt text-white"
                    >
                      Add Client Product
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "PIC") {
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
                    Add PIC Stock
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      label="PIC Name"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={staff}
                      onValueChange={setStaff}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={pushDataType}
                      isDisabled={loading}
                      className="bg-greenbt text-white"
                    >
                      Add PIC Stock
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "Category") {
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
                    Product Category Out
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      label="Category Name"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={category}
                      onValueChange={setCategory}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={pushDataType}
                      isDisabled={loading}
                      className="bg-greenbt text-white"
                    >
                      Add Category Product Out
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    } else if (modal === "Platform") {
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
                    Platform Store
                  </ModalHeader>
                  <ModalBody>
                    <Input
                      autoFocus
                      label="Platform Name"
                      labelPlacement="outside"
                      type="text"
                      variant="bordered"
                      value={platform}
                      onValueChange={setPlatform}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="flat"
                      onPress={pushDataType}
                      isDisabled={loading}
                      className="bg-greenbt text-white"
                    >
                      Add Platform Store
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      );
    }
  }, [
    category,
    client,
    description,
    isOpen,
    loading,
    modal,
    onOpenChange,
    platform,
    pushDataType,
    staff,
    type,
  ]);
  const openAddModal = useCallback(() => {
    setModalRender("Add");
    onOpen();
  }, [onOpen]);

  const openAddClient = useCallback(() => {
    setModalRender("Client");
    onOpen();
  }, [onOpen]);
  const openAddStaff = useCallback(() => {
    setModalRender("PIC");
    onOpen();
  }, [onOpen]);
  const openAddCategoty = useCallback(() => {
    setModalRender("Category");
    onOpen();
  }, [onOpen]);
  const openAddPlatform = useCallback(() => {
    setModalRender("Platform");
    onOpen();
  }, [onOpen]);

  return (
    <div className="flex flex-col p-5">
      {renderModal()}
      <div>Admin</div>
      <div className="flex flex-row justify-between">
        <div>Type Product</div>
        <div>
          <Button onPress={openAddModal}>Add More</Button>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>Client Product</div>
        <div>
          <Button onPress={openAddClient}>Add Client</Button>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>PIC Stock</div>
        <div>
          <Button onPress={openAddStaff}>Add PIC</Button>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>Product Category Out</div>
        <div>
          <Button onPress={openAddCategoty}>Add Category</Button>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>Platform Store</div>
        <div>
          <Button onPress={openAddPlatform}>Add Platform</Button>
        </div>
      </div>
    </div>
  );
}
