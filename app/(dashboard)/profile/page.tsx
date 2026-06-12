import type { Metadata } from "next";
import { PageHeader } from "@/components/shared";
import { ProfileClient } from "./_components/profile-client";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return (
    <div className="flex min-h-full flex-col bg-[#f8fafc]">
      <PageHeader title="My Profile" breadcrumb={[{ label: "My profile" }]} />
      <ProfileClient />
    </div>
  );
}
