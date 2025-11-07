// Admin Sidebar icons.
import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import { FaTrophy } from "react-icons/fa";
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from "@/routes/AdminPanelRoute";
import { url } from "zod";

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
        title: 'Coupons',
        url: "#",
        icon: RiCoupon2Line,
        submenu: [
            {
                title: "Add Coupon",
                url: '#'
            },
            {
                title: "All Coupons",
                url: '#'
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
    },
    {
        title: 'Rating & Review',
        url: "#",
        icon: IoMdStarOutline,
    },
    {
        title: 'Tournaments',
        url: "/admin/tournaments",
        icon: FaTrophy,
    },
    {
        title: 'Media',
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
]