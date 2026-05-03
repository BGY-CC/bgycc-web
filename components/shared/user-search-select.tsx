"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, X, Check } from "lucide-react";
import { Input, Skeleton } from "@/components/ui";
import { profilesService, UserProfile } from "@/lib/services/profiles";
import { cn } from "@/lib/utils";

interface UserSearchSelectProps {
  value?: string; // userId
  onChange: (userId: string, user: UserProfile | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function UserSearchSelect({
  value,
  onChange,
  placeholder = "Search users...",
  label,
  error,
  disabled
}: UserSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch initial user if value is provided
  useEffect(() => {
    if (value && !selectedUser) {
      profilesService.getDetails(value).then(res => {
        if (res.success) {
          setSelectedUser(res.data);
          setQuery(res.data.full_name || res.data.email || "");
        }
      });
    }
  }, [value, selectedUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2 && isOpen && !selectedUser) {
        setIsLoading(true);
        try {
          const res = await profilesService.search(query);
          if (res.success) {
            setResults(res.data.users || []);
          }
        } catch (error) {
          console.error("Failed to search users", error);
        } finally {
          setIsLoading(false);
        }
      } else if (query.length < 2) {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, selectedUser]);

  const handleSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setQuery(user.full_name || user.email || "");
    onChange(user.id, user);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setQuery("");
    setResults([]);
    onChange("", null);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedUser) {
              handleClear();
            }
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-10",
            error ? "border-red-500 focus:ring-red-500" : ""
          )}
        />

        {selectedUser && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && (query.length >= 2 || isLoading) && !selectedUser && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="px-4 py-2 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-primary/10",
                  "text-gray-900"
                )}
                onClick={() => handleSelect(user)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <User className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                  <span className="ml-3 block truncate font-medium">
                    {user.full_name || "Unknown User"}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {user.email}
                  </span>
                  {user.club_id && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded-full">
                      Has Club
                    </span>
                  )}
                  {user.role === 'leader' && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded-full">
                      Leader
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
