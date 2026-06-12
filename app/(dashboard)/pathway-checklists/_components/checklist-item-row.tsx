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

const ScheduleIndicator = ({ item, className }: { item: ChecklistItem; className?: string }) => {
  const scheduleType = item.metadata?.schedule || (item.day_of_week !== null ? "Weekly" : "Everyday");

  if (scheduleType === "Everyday") {
    return (
      <div className={cn("flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2", className)}>
        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full">
          <RefreshCw className="h-3 w-3" />
          Everyday
        </Badge>
        <span className="text-[10px] font-normal italic text-muted-foreground">Mon - Sun</span>
      </div>
    );
  }

  if (scheduleType === "Weekly") {
    return (
      <div className={cn("flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2", className)}>
        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full">
          <Calendar className="h-3 w-3" />
          Weekly
        </Badge>
        <span className="text-[10px] font-normal italic text-muted-foreground">
          {item.day_of_week !== null ? getDayName(item.day_of_week) : "Every Week"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2", className)}>
      <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-200 bg-rose-50 flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full">
        <Clock className="h-3 w-3" />
        Specific Day
      </Badge>
      <span className="text-[10px] font-normal italic text-muted-foreground">
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

  const type = item.slug || "Task";

  return (
    <div className="group -mx-4 flex flex-col gap-4 border-b border-gray-100 px-4 py-5 transition-all duration-300 last:border-0 hover:bg-slate-50/50 sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:px-6 sm:py-6 sm:hover:border-primary/20 sm:hover:bg-white sm:hover:shadow-md">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-600 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {getTaskIcon(type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold leading-tight text-slate-900 break-words">
              {item.name}
            </h3>
            <Badge variant="default" className="max-w-full break-all rounded-full border-0 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {type}
            </Badge>
            {!item.is_active && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-gray-300 text-gray-400 rounded-full">
                Inactive
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 font-normal line-clamp-2 max-w-full">
            {item.description || "No description provided."}
          </p>
        </div>
      </div>
      
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:justify-end md:gap-8">
        <ScheduleIndicator 
          item={item} 
          className="min-w-0 md:flex-col md:items-end md:gap-1"
        />
        
        <div className="flex min-h-11 shrink-0 items-center self-end sm:self-auto">
          <ActionMenu items={menuItems} />
        </div>
      </div>
    </div>
  );
}
