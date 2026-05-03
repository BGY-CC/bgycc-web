"use client";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import { SearchInput } from "./search-input";
import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { useSidebar } from "../layout/sidebar-context";

import { useAuth } from "@/hooks/use-auth";

interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

/**
 * Consistent page header: top nav style with search and profile.
 */
export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  const { setIsOpen } = useSidebar();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.full_name) {
      const parts = user.full_name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || "AD";
  };

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
              {user?.profile_picture_url ? (
                <Image
                  src={user.profile_picture_url}
                  alt={user.full_name || "Profile"}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
                  {getInitials()}
                </div>
              )}
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
