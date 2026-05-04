'use client'

import { zSchema } from '@/lib/zodSchema'                       
import { zodResolver } from '@hookform/resolvers/zod'           
import React, { useState, useEffect } from 'react'
import { ButtonLoading } from './ButtonLoading'                 
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"                                  
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"                             
import { showToast } from '@/lib/showToast'                     
import axios from 'axios'                                     
import { apiUrl, axiosWithCredentials } from '@/lib/apiClient'
const OTPVerification = ({ email, onSubmit, loading }) => {
  const [isResendingOtp, setIsResendingOtp] = useState(false)  

  const formSchema = zSchema.pick({
    otp: true,
    email: true,
  })


  const form = useForm({
    resolver: zodResolver(formSchema),  
    defaultValues: {
      otp: '',
      email: '',                       
    },
  })

  useEffect(() => {
    if (email) {
      form.setValue('email', email)
    }
  }, [email, form])

  // Regex for 6-digit numeric OTP
  const REGEXP_ONLY_DIGITS_AND_CHARS = /^[0-9]{6}$/

  const handleOtpVerification = async (values) => {
    onSubmit(values)
  }

  const resendOTP = async () => {
    if (!email) {
      showToast("error", "Email not available, cannot resend OTP")
      return
    }

    try {
      setIsResendingOtp(true)

      const { data: resendOtpResponse } = await axios.post(
        apiUrl('/auth/resend-otp'),
        { email },
        axiosWithCredentials,
      )

      if (!resendOtpResponse.success) {
        throw new Error(resendOtpResponse.message)
      }

      showToast('success', resendOtpResponse.message)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.code === 'ECONNABORTED'
          ? 'Resending OTP is taking too long. Please try again.'
          : error.response?.data?.message || error.message
        : error.message
      showToast('error', message || 'Failed to resend OTP')
    } finally {
      setIsResendingOtp(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOtpVerification)}>
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 mt-3">
              Please complete verification
            </h1>
            <p className="text-md">
              We have sent a One-time Password (OTP) to your registered email
              address. The OTP is valid for 10 minutes only.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-5 mt-5 flex justify-center">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold block text-center">
                    One-time Password (OTP)
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}         
                      onChange={field.onChange}   
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot
                            key={i}
                            className="text-xl size-10"
                            index={i}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />                 
                </FormItem>
              )}
            />
          </div>

          {/* Submit + Resend */}
          <div className="mb-2">
            <ButtonLoading
              loading={loading}
              type="submit"
              text="Verify"
              className="w-full cursor-pointer"
            />

            <div className="text-center mt-5">
              {isResendingOtp ? (
                <span className="text-md">Resending...</span>
              ) : (
                <button
                  onClick={resendOTP}
                  type="button"
                  className="text-blue-500 cursor-pointer hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default OTPVerification
