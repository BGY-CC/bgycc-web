"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Globe, MousePointer2, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReferralAnalytics() {
  return (
    <div className="space-y-8">
      {/* Conversion Funnel */}
      <Card className="border-none shadow-xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-primary">Conversion Funnel</CardTitle>
            <CardDescription>Measuring the journey from invite to active member</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 text-center p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <MousePointer2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-blue-900">1,240</p>
              <p className="text-sm font-semibold text-blue-700">Link Clicks</p>
              <Badge variant="outline" className="bg-white/50 border-blue-200 text-blue-600">
                +12% vs last month
              </Badge>
            </div>

            <div className="space-y-2 text-center p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100">
              <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-indigo-900">845</p>
              <p className="text-sm font-semibold text-indigo-700">App Installs</p>
              <Badge variant="outline" className="bg-white/50 border-indigo-200 text-indigo-600">
                68% CR
              </Badge>
            </div>

            <div className="space-y-2 text-center p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-900">512</p>
              <p className="text-sm font-semibold text-emerald-700">Active Members</p>
              <Badge variant="outline" className="bg-white/50 border-emerald-200 text-emerald-600">
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
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">{item.location}</span>
                  <span className="text-subtle font-medium">{item.count} referrals</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
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
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 space-y-4 bg-primary text-white">
            <h3 className="text-2xl font-black">QR vs Link</h3>
            <p className="text-primary-foreground/80 text-sm">
              In-person events drive 40% of our referrals through scannable QR codes.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">60%</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Direct Links</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">40%</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">QR Codes</p>
              </div>
            </div>
          </div>
          <div className="p-8 bg-gray-50 flex items-center justify-center">
             <div className="text-center space-y-2">
               <div className="mx-auto w-24 h-24 bg-white rounded-2xl shadow-inner flex items-center justify-center border border-gray-100">
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
