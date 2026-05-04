'use client'

import React from 'react'
import { RiLogoutCircleRLine } from "react-icons/ri";
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { useRouter } from "next/navigation"; 
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/reducer/authReducer';
import { apiUrl, axiosWithCredentials } from '@/lib/apiClient';

const LogoutButton = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      const { data: logoutResponse } = await axios.post(
        apiUrl('/auth/logout'),
        {},
        axiosWithCredentials,
      )
      if(!logoutResponse.success){
        throw new Error(logoutResponse.message)
      }

      dispatch(logout())
      localStorage.removeItem("playerEmail")
      showToast('success', logoutResponse.message)
      router.replace(WEBSITE_LOGIN)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message
      showToast('error', message || 'Logout failed')
    }
  }

  return (
    <DropdownMenuItem onClick={handleLogout} className='cursor-pointer flex items-center gap-2'>
        <RiLogoutCircleRLine color='red'/>
        Logout
    </DropdownMenuItem>
  )
}

export default LogoutButton
