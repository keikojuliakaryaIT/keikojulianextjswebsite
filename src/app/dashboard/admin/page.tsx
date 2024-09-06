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
import { toast } from "sonner";
export default function Admin() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [modal, setModalRender] = React.useState("add");
  const [type, setType] = useState("");

  async function pushDataType() {
    const { result, error } = await createData(`Inventory/Admin/Type`, {
      type: type,
    });
    if (!error) {
      console.log("result berhasil");
    } else {
      toast("Success");
    }
  }

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
    }
  }
  const openAddModal = useCallback(() => {
    setModalRender("Add");
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
    </div>
  );
}
