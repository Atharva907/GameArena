'use client';

import { Card, CardContent } from '@/components/ui/card';
import React, { useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/assets/images/GameArenaLogo.png';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { zSchema } from '@/lib/zodSchema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ButtonLoading } from '@/components/Application/ButtonLoading';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import OTPVerification from '@/components/Application/OTPVerification';
import UpdatePassword from '@/components/Application/UpdatePassword';
import Link from 'next/link';
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute';

const ResetPassword = () => {
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const form = useForm({
    resolver: zodResolver(zSchema.pick({ email: true })),
    defaultValues: { email: '' }
  });

  const handleEmailVerification = async (values) => {
    try {
      setEmailVerificationLoading(true);
      const { data: response } = await axios.post('/api/auth/reset-password/send-otp', values);
      if (!response.success) throw new Error(response.message);

      showToast('success', response.message);
      setOtpEmail(values.email);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      showToast('error', message);
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleOtpVerification = async (values) => {
    try {
      setOtpVerificationLoading(true);
      const { data: response } = await axios.post('/api/auth/reset-password/verify-otp', {
        ...values,
        email: otpEmail
      });
      if (!response.success) throw new Error(response.message);

      showToast('success', response.message);
      setResetToken(response.data.resetToken);
      setIsOtpVerified(true);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      showToast('error', message);
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      echo {/* Background Video */}
      <div className="absolute inset-0 -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/assets/angel-sage.3840x2160.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div> {">"} temp.txt

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 -z-10"></div>

      {/* Foreground Content */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <Card className="w-[400px] bg-white/90 backdrop-blur-md shadow-xl">
          <CardContent>
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <Image
                src={Logo.src}
                width={Logo.width}
                height={Logo.height}
                alt="Logo"
                className="max-w-[150px]"
              />
            </div>

            {!otpEmail ? (
              <>
                <div className="text-center mb-5">
                  <h1 className="text-3xl font-bold">Reset Password</h1>
                  <p>Enter your email to receive an OTP for password reset.</p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmailVerification)}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="mb-5">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <ButtonLoading
                      loading={emailVerificationLoading}
                      type="submit"
                      text="Send OTP"
                      className="w-full mb-3"
                    />
                    <div className="text-center">
                      <Link href={WEBSITE_LOGIN} className="text-primary underline">
                        Back to Login
                      </Link>
                    </div>
                  </form>
                </Form>
              </>
            ) : (
              <>
                {!isOtpVerified ? (
                  <>
                    <p className="text-center text-sm mb-3">
                      OTP sent to: <b>{otpEmail}</b>
                    </p>
                    <OTPVerification
                      email={otpEmail}
                      onSubmit={handleOtpVerification}
                      loading={otpVerificationLoading}
                    />
                  </>
                ) : (
                  <div className="flex justify-center">
                    <UpdatePassword email={otpEmail} resetToken={resetToken} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;