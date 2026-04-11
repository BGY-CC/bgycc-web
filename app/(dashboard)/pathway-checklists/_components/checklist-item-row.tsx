"use client";

import { ClipboardList, Pencil, Trash2, Zap } from "lucide-react";
import { Badge, ActionMenu, type DropdownItem } from "@/components/ui";
import { ChecklistItem } from "@/lib/services/checklist";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onEdit: (item: ChecklistItem) => void;
  onRemove: (item: ChecklistItem) => void;
}

export function ChecklistItemRow({ item, onEdit, onRemove }: ChecklistItemRowProps) {
  const menuItems: DropdownItem[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => onEdit(item),
    },
    {
      label: "Remove",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onRemove(item),
      variant: "destructive",
    },
  ];

  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0 hover:bg-background/30 px-4 -mx-4 rounded-2xl transition-colors group">
      <div className="flex items-start gap-4 min-w-0">
        {/* Task icon */}
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm group-hover:scale-105 transition-transform">
          <ClipboardList className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-primary tracking-tight">{item.name}</span>
            {!item.is_active && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-300 text-gray-400">
                Inactive
              </Badge>
            )}
            <Badge variant="default" className="text-[10px] px-2 py-0">
              {item.pathway}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-muted font-medium line-clamp-1">{item.description || "No description provided."}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <span className="flex items-center justify-end gap-1 text-[11px] font-bold uppercase tracking-wider text-accent">
            <Zap className="h-3 w-3 fill-accent" />
            {item.xp_value} XP
          </span>
          <p className="text-[10px] text-subtle font-bold mt-1 uppercase tracking-tighter opacity-60">
            SLUG: {item.slug}
          </p>
        </div>

        <ActionMenu items={menuItems} />
      </div>
    </div>
  );
}
