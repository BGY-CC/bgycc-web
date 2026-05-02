"use client";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import { SearchInput } from "./search-input";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { useSidebar } from "../layout/sidebar-context";

interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

/**
 * Consistent page header: top nav style with search and profile.
 */
export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  const { setIsOpen } = useSidebar();

  return (
    <header className="w-full bg-white px-4 py-4 border-b border-gray-100 mb-6 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="md:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#1e293b] sm:text-2xl">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-2xl justify-end">
          <div className="hidden sm:block w-full max-w-md">
            <SearchInput 
              placeholder="Search..." 
              className="bg-[#f1f5f9] border-none h-11 rounded-xl"
              containerClassName="w-full"
            />
          </div>
          
          <div className="flex shrink-0 items-center gap-3">
            <div className="sm:hidden">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                alt="Profile"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {breadcrumb && breadcrumb.length > 0 && (
        <div className="pt-1 border-t border-gray-50">
          <Breadcrumb items={breadcrumb} />
        </div>
      )}
    </header>
  );
}
