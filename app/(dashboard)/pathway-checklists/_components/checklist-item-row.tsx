"use client";

import { Pencil, Trash2, RefreshCw, Calendar, Clock, ClipboardList, Video } from "lucide-react";
import { Badge, ActionMenu, type DropdownItem } from "@/components/ui";
import { ChecklistItem } from "@/lib/services/checklist";
import { cn } from "@/lib/utils";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onEdit: (item: ChecklistItem) => void;
  onRemove: (item: ChecklistItem) => void;
}

const getTaskIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "watch video": return <Video className="h-5 w-5" />;
    default: return <ClipboardList className="h-5 w-5" />;
  }
};

const getDayName = (day: number) => {
  const days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  return days[day] || "Unknown";
};

const ScheduleIndicator = ({ item }: { item: ChecklistItem }) => {
  const scheduleType = item.metadata?.schedule || (item.day_of_week !== null ? "Weekly" : "Everyday");

  if (scheduleType === "Everyday") {
    return (
      <div className="flex flex-col items-end">
        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Everyday
        </Badge>
        <span className="text-[10px] text-muted-foreground mt-1 font-normal italic">Mon - Sun</span>
      </div>
    );
  }

  if (scheduleType === "Weekly") {
    return (
      <div className="flex flex-col items-end">
        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Weekly
        </Badge>
        <span className="text-[10px] text-muted-foreground mt-1 font-normal italic">
          {item.day_of_week !== null ? getDayName(item.day_of_week) : "Every Week"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Specific Day
      </Badge>
      <span className="text-[10px] text-muted-foreground mt-1 font-normal italic">
        {item.cycle_number ? `Cycle ${item.cycle_number}, ` : ""}Day {item.day_number || 0}
      </span>
    </div>
  );
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

  const type = item.metadata?.type || "Task";

  return (
    <div className="flex items-center justify-between gap-4 py-5 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 px-4 -mx-4 rounded-xl transition-all group">
      <div className="flex items-center gap-4 min-w-0">
        {/* Task icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-600 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {getTaskIcon(type)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-medium text-slate-900 truncate">
              {item.name}
            </h3>
            <Badge variant="default" className="text-[10px] font-normal bg-slate-100 text-slate-600 border-0 px-2 py-0">
              {type}
            </Badge>
            {!item.is_active && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-gray-300 text-gray-400">
                Inactive
              </Badge>
            )}
          </div>
          <p className="mt-1 text-[13px] text-slate-500 font-normal line-clamp-1 max-w-[500px]">
            {item.description || "No description provided."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8 shrink-0">
        <ScheduleIndicator item={item} />
        <ActionMenu items={menuItems} />
      </div>
    </div>
  );
}
