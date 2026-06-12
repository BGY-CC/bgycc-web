"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Globe, MousePointer2, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReferralAnalytics() {
  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl font-bold text-primary">Conversion Funnel</CardTitle>
            <CardDescription>Measuring the journey from invite to active member</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-11 w-full gap-2 px-4 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2 rounded-3xl border border-blue-100 bg-blue-50/50 p-5 text-center sm:p-6">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                <MousePointer2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-blue-900">1,240</p>
              <p className="text-sm font-semibold text-blue-700">Link Clicks</p>
              <Badge variant="outline" className="border-blue-200 bg-white/50 text-blue-600">
                +12% vs last month
              </Badge>
            </div>

            <div className="space-y-2 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 text-center sm:p-6">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-indigo-900">845</p>
              <p className="text-sm font-semibold text-indigo-700">App Installs</p>
              <Badge variant="outline" className="border-indigo-200 bg-white/50 text-indigo-600">
                68% CR
              </Badge>
            </div>

            <div className="space-y-2 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 text-center sm:p-6 sm:col-span-2 xl:col-span-1">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-900">512</p>
              <p className="text-sm font-semibold text-emerald-700">Active Members</p>
              <Badge variant="outline" className="border-emerald-200 bg-white/50 text-emerald-600">
                60% Retention
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographical Spread */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Geographical Reach</CardTitle>
          </div>
          <CardDescription>Top states and cities driving organic growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              { location: "Lagos, Nigeria", count: 245, percentage: 48 },
              { location: "Abuja, Nigeria", count: 112, percentage: 22 },
              { location: "Port Harcourt, Nigeria", count: 78, percentage: 15 },
              { location: "Accra, Ghana", count: 42, percentage: 8 },
              { location: "Others", count: 35, percentage: 7 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-gray-700">{item.location}</span>
                  <span className="text-subtle font-medium">{item.count} referrals</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card className="border-none bg-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4 bg-primary p-6 text-white sm:p-8">
            <h3 className="text-2xl font-black">QR vs Link</h3>
            <p className="text-primary-foreground/80 text-sm">
              In-person events drive 40% of our referrals through scannable QR codes.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">60%</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Direct Links</p>
              </div>
              <div className="h-px bg-white/20 sm:h-12 sm:w-px" />
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">40%</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">QR Codes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-gray-50 p-6 sm:p-8">
             <div className="space-y-2 text-center">
               <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-inner">
                  <BarChart3 className="h-10 w-10 text-gray-300" />
               </div>
               <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                 Source Distribution Chart
               </p>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
