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
  Everyday: "text-green-600",
  Weekly: "text-orange-500",
  "Specific Day": "text-red-500",
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
    <div className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        {/* Task icon */}
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <ClipboardList className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{item.title}</span>
            <Badge variant="default" className="text-xs bg-gray-100 text-gray-600">
              {item.type}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Schedule */}
        <div className="text-right hidden sm:block">
          <span
            className={`flex items-center gap-1 text-xs font-medium ${scheduleColor[item.schedule]}`}
          >
            {scheduleIcon[item.schedule]}
            {item.schedule}
          </span>
          {item.days && (
            <p className="text-xs text-gray-400 mt-0.5">{item.days}</p>
          )}
          {item.cycleDay && (
            <p className="text-xs text-gray-400 mt-0.5">{item.cycleDay}</p>
          )}
        </div>

        <ActionMenu items={menuItems} />
      </div>
    </div>
  );
}
