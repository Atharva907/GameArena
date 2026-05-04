import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEBSITE_HOME, NEWS_PAGE } from "@/routes/WebsiteRoute";
import { getNewsItemById } from "@/lib/newsData";

export default function NewsDetailPage({ params }) {
  const item = getNewsItemById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href={NEWS_PAGE}>
            <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </Link>
          <Link href={WEBSITE_HOME}>
            <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-800">
              Home
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-slate-700 bg-slate-800/70 text-white backdrop-blur-sm">
          <div className="h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-purple-500/50 bg-purple-600/20 text-purple-300">
                {item.category}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                {item.date}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <User className="h-3.5 w-3.5" />
                {item.author}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold md:text-4xl">{item.title}</h1>
              <p className="text-lg leading-8 text-gray-300">{item.excerpt}</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                Detailed article
              </div>
              <p className="whitespace-pre-line leading-8 text-gray-200">{item.content}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={NEWS_PAGE}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  More News
                </Button>
              </Link>
              <Link href={WEBSITE_HOME}>
                <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-800">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
