"use client";

import { ClipboardList, RefreshCw, Calendar, Pencil, Trash2 } from "lucide-react";
import { Badge, ActionMenu, type DropdownItem } from "@/components/ui";
import type { ChecklistItem } from "./types";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onEdit: (item: ChecklistItem) => void;
  onRemove: (item: ChecklistItem) => void;
}

const scheduleIcon = {
  Everyday: <RefreshCw className="h-3.5 w-3.5" />,
  Weekly: <Calendar className="h-3.5 w-3.5" />,
  "Specific Day": <Calendar className="h-3.5 w-3.5" />,
};

const scheduleColor = {
  Everyday: "text-success",
  Weekly: "text-warning",
  "Specific Day": "text-error",
};

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
    <div className="flex items-start justify-between gap-4 py-6 border-b border-border last:border-0 hover:bg-background/30 px-4 -mx-4 rounded-2xl transition-colors group">
      <div className="flex items-start gap-4 min-w-0">
        {/* Task icon */}
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-sm group-hover:scale-105 transition-transform">
          <ClipboardList className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-primary tracking-tight">{item.title}</span>
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {item.type}
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-muted font-medium line-clamp-1">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Schedule */}
        <div className="text-right hidden sm:block">
          <span
            className={`flex items-center justify-end gap-1.5 text-[11px] font-bold uppercase tracking-wider ${scheduleColor[item.schedule]}`}
          >
            {item.schedule}
          </span>
          {item.days && (
            <p className="text-[11px] text-subtle font-bold mt-1 uppercase tracking-tighter opacity-60">
              {item.days}
            </p>
          )}
          {item.cycleDay && (
            <p className="text-[11px] text-subtle font-bold mt-1 uppercase tracking-tighter opacity-60">
              {item.cycleDay}
            </p>
          )}
        </div>

        <ActionMenu items={menuItems} />
      </div>
    </div>
  );
}
