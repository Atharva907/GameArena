import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { MdOutlinePermMedia } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import {
  ADMIN_DASHBOARD,
  ADMIN_MEDIA_SHOW,
  ADMIN_USERS,
} from "@/routes/AdminPanelRoute";

export const adminSidebarMenu = [
    {
        title: 'Dashboard',
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
    },
    {
        title: 'Category',
        url: "#",
        icon: BiCategory,
        submenu: [
            {
                title: "Add Category",
                url: '/admin/categories/new'
            },
            {
                title: "All Categories",
                url: '/admin/categories'
            },
        ]
    },
    {
        title: 'Products',
        url: "#",
        icon: IoShirtOutline,
        submenu: [
            {
                title: "Add Product",
                url: '/admin/products/new'
            },
            {
                title: "All Products",
                url: '/admin/products'
            },
        ]
    },
    {
        title: 'Orders',
        url: "/admin/orders",
        icon: MdOutlineShoppingBag,
    },
    {
        title: 'Customers',
        url: "#",
        icon: LuUserRound,
        submenu: [
            {
                title: "All Users",
                url: ADMIN_USERS
            },
        ]
    },
    {
        title: 'Tournaments',
        url: "#",
        icon: FaTrophy,
        submenu: [
            {
                title: "All Tournaments",
                url: "/admin/tournaments"
            }
        ]
    },
    {
        title: 'Media',
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
]
