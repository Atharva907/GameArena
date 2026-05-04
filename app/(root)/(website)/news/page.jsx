import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";
import { newsItems } from "@/lib/newsData";

const NewsPage = () => {
  const featuredNews = newsItems.filter((item) => item.featured);
  const regularNews = newsItems.filter((item) => !item.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white md:p-8">
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="mb-4 flex items-center gap-4">
          <Link href={WEBSITE_HOME}>
            <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <h1 className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Gaming News
        </h1>
        <p className="text-gray-300">Stay updated with the latest gaming news, tournaments, and updates</p>
      </div>

      <div className="mx-auto max-w-7xl">
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Featured News</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredNews.map((item) => (
                <Card key={item.id} className="overflow-hidden border-slate-700 bg-slate-800/60 text-white backdrop-blur-sm">
                  <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <Badge className="border-purple-500/50 bg-purple-600/20 text-purple-300">
                        {item.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {item.date}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-300">{item.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {item.author}
                      </div>
                      <Button asChild variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20">
                        <Link href={`/news/${item.id}`}>Read More</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {regularNews.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Latest News</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularNews.map((item) => (
                <Card key={item.id} className="overflow-hidden border-slate-700 bg-slate-800/60 text-white backdrop-blur-sm">
                  <div className="h-48 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between">
                      <Badge className="border-blue-500/50 bg-blue-600/20 text-blue-300">
                        {item.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {item.date}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-gray-300">{item.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {item.author}
                      </div>
                      <Button asChild variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-600/20">
                        <Link href={`/news/${item.id}`}>Read More</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
