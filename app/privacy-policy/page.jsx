import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href={WEBSITE_HOME}>
          <Button variant="outline" className="mb-6 border-slate-600 text-gray-300 hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 backdrop-blur-sm md:p-8">
          <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
          <p className="mb-4 leading-8 text-gray-300">
            GameArena collects only the account, profile, wallet, tournament, and order information needed to run the platform. Data is used to authenticate users, process registrations, manage purchases, and send service emails such as OTPs and confirmations.
          </p>
          <p className="leading-8 text-gray-300">
            Uploaded assets and transactional records are stored securely and are accessible only to authenticated users with the appropriate role. The platform does not sell personal data and uses cookies strictly for session management and account security.
          </p>
        </div>
      </div>
    </div>
  );
}
