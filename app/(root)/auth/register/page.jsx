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
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = zSchema
    .pick({ name: true, email: true, password: true })
    .extend({ confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password and confirm password must be same.",
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegisterSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: registerResponse } = await axios.post(
        "/api/auth/register",
        values
      );

      if (!registerResponse.success) {
        throw new Error(registerResponse.message);
      }

      form.reset();
      showToast("success", registerResponse.message);
      // router.push("/");
    } catch (error) {
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else {
        message = error.message;
      }
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Video */}
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
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 -z-10"></div>

      {/* Foreground Content */}
      <div className="relative z-10 flex items-center justify-center w-full">
        <Card className="w-[400px] bg-white/90 backdrop-blur-md shadow-xl">
          <CardContent>
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src={Logo.src}
                width={Logo.width}
                height={Logo.height}
                alt="logo"
                className="max-w-[150px]"
              />
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p>Create account by filling out the form below.</p>
            </div>

            {/* Form */}
            <div className="mt-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRegisterSubmit)}>
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
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

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="mb-5 relative">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="mb-5 relative">
                        <FormLabel>Confirm Password</FormLabel>
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
                      text="Create Account"
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Link to Login */}
                  <div className="text-center">
                    <div className="flex justify-center gap-1 items-center">
                      <p>Already have an account?</p>
                      <Link href={WEBSITE_LOGIN} className="text-primary underline">
                        Login!
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
