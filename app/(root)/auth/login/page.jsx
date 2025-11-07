"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import Logo from "@/public/assets/images/GameArenaLogo.png";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { zSchema } from "@/lib/zodSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ButtonLoading } from "@/components/Application/ButtonLoading";
import { z } from "zod";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import Link from "next/link";
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Application/OTPVerification";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";
import { useRouter, useSearchParams } from "next/navigation";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

const LoginPage = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState();

  const formSchema = zSchema
    .pick({ email: true })
    .extend({ password: z.string().min(3, "Password field is required.") });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLoginSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: loginResponse } = await axios.post("/api/auth/login", values);

      if (!loginResponse.success) throw new Error(loginResponse.message);

      setOtpEmail(values.email);
      form.reset();
      showToast("success", loginResponse.message);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (values) => {
    try {
      setOtpVerificationLoading(true);
      const { data: otpResponse } = await axios.post("/api/auth/verify-otp", values);

      if (!otpResponse.success) throw new Error(otpResponse.message);

      setOtpEmail("");
      showToast("success", otpResponse.message);
      
      // Save token to cookie for future API requests
      console.log('Saving token to cookie:', otpResponse.data.token);
      // Set cookie with longer expiration time (24 hours = 86400 seconds)
      const cookieString = `token=${otpResponse.data.token}; path=/; max-age=86400`;
      // Removed secure and samesite attributes for local development
      document.cookie = cookieString;
      console.log('Cookie set:', document.cookie);
      
      dispatch(login(otpResponse.data));

      if (searchParams.has("callback")) {
        router.push(searchParams.get("callback"));
      } else {
        otpResponse.data.role === "admin"
          ? router.push(ADMIN_DASHBOARD)
          : router.push(USER_DASHBOARD);
      }
    } catch (error) {
      showToast("error", error.message);
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
                alt="logo"
                className="max-w-[150px]"
              />
            </div>

            {!otpEmail ? (
              <>
                {/* Login Form */}
                <div className="text-center mb-5">
                  <h1 className="text-3xl font-bold">Login Into Account</h1>
                  <p>Login into your account by filling out the form below.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
                    {/* Email */}
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

                    {/* Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="mb-5 relative">
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="mb-3">
                      <ButtonLoading
                        loading={loading}
                        type="submit"
                        text="Login"
                        className="w-full cursor-pointer"
                      />
                    </div>

                    {/* Links */}
                    <div className="text-center">
                      <div className="flex justify-center gap-1 items-center mb-2">
                        <p>Don't have account?</p>
                        <Link href={WEBSITE_REGISTER} className="text-primary underline">
                          Create account!
                        </Link>
                      </div>
                      <div>
                        <Link href={WEBSITE_RESETPASSWORD} className="text-primary underline">
                          Forget password?
                        </Link>
                      </div>
                    </div>
                  </form>
                </Form>
              </>
            ) : (
              <OTPVerification
                email={otpEmail}
                onSubmit={handleOtpVerification}
                loading={otpVerificationLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
