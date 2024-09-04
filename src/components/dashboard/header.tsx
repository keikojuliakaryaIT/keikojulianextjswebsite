"use client";
import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@nextui-org/react";
import { TiThMenu } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";

export default function HeaderDashboard() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { title: "Home", href: "dashboard/home" },
    { title: "Admin", href: "dashboard/admin" },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          icon={isMenuOpen ? <IoMdClose /> : <TiThMenu />}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>
      <NavbarContent justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit">Keiko Julia Karya</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent />
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.title}-${index}`}>
            <Link
              color={"foreground"}
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.title}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
