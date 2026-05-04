import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

export default function TermsOfServicePage() {
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
          <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
          <p className="mb-4 leading-8 text-gray-300">
            GameArena is provided as a tournament and commerce platform for registered users. Accounts must be kept accurate, wallets may only be used within the platform rules, and tournament registrations are subject to eligibility and stock or balance checks.
          </p>
          <p className="leading-8 text-gray-300">
            Misuse of the service, including fraudulent registrations, unauthorized access, or attempts to manipulate wallet or order workflows, may result in account restrictions or removal.
          </p>
        </div>
      </div>
    </div>
  );
}
