"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Image from "next/image";
import VerifiedImg from "@/public/assets/images/verified.gif";
import VerificationFailedImg from "@/public/assets/images/verification-failed.gif";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage({ params }) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Use decodeURIComponent in case token has special characters
        const decodedToken = decodeURIComponent(token);

        const { data } = await axios.post("/api/auth/verify-email", { token: decodedToken });

        setIsVerified(data.success);
        setMessage(data.message || "");
      } catch (error) {
        setIsVerified(false);

        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage("Something went wrong while verifying your email.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyEmail();
  }, [token]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-center text-lg">Verifying your email...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isVerified ? (
        <>
          <Image src={VerifiedImg} alt="Verified" className="h-[120px] w-auto" />
          <h1 className="text-2xl font-bold text-green-600 my-4">
            Email verification successful!
          </h1>
          {message && <p className="text-center text-gray-700 mb-4">{message}</p>}
          <Button asChild>
            <Link href={WEBSITE_HOME}>Go to Home</Link>
          </Button>
        </>
      ) : (
        <>
          <Image src={VerificationFailedImg} alt="Failed" className="h-[120px] w-auto" />
          <h1 className="text-2xl font-bold text-red-600 my-4">
            Email verification failed!
          </h1>
          {message && <p className="text-center text-gray-700 mb-4">{message}</p>}
          <Button asChild>
            <Link href={WEBSITE_HOME}>Go to Home</Link>
          </Button>
        </>
      )}
    </div>
  );
}
