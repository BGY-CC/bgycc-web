"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  ClipboardList,
  PenSquare,
  FolderOpen,
  Megaphone,
  UserRoundCheck,
  User,
  Building2,
  Map as MapIcon,
  CheckSquare,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { useCommandPalette } from "./command-palette-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchService, type SearchResultItem, type SearchResultType } from "@/lib/services/search";
import { cn } from "@/lib/utils";

interface PageEntry {
  label: string;
  href: string;
  description: string;
  keywords?: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const PAGES: PageEntry[] = [
  { label: "Dashboard", href: "/dashboard", description: "Overview & key metrics", icon: LayoutDashboard, keywords: ["home", "overview", "stats"] },
  { label: "Clubs", href: "/clubs", description: "Manage all clubs", icon: Users, keywords: ["chapters"] },
  { label: "Pathway Checklists", href: "/pathway-checklists", description: "Edit pathway curriculum", icon: ClipboardList, keywords: ["curriculum", "checklist"] },
  { label: "Onboarding Editor", href: "/onboarding-editor", description: "Edit onboarding flow", icon: PenSquare, keywords: ["onboard", "intro"] },
  { label: "Resources", href: "/resources", description: "Manage learning resources", icon: FolderOpen, keywords: ["library", "materials"] },
  { label: "Announcement", href: "/announcement", description: "Send announcements", icon: Megaphone, keywords: ["broadcast", "notice"] },
  { label: "Leader Management", href: "/leaders", description: "Promote & revoke leaders", icon: UserRoundCheck, keywords: ["users", "members", "people"] },
];

const TYPE_META: Record<SearchResultType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  user: { label: "People", icon: User },
  club: { label: "Clubs", icon: Building2 },
  resource: { label: "Resources", icon: FolderOpen },
  announcement: { label: "Announcements", icon: Megaphone },
  pathway: { label: "Pathways", icon: MapIcon },
  checklist: { label: "Checklists", icon: CheckSquare },
};

const TYPE_ORDER: SearchResultType[] = ["user", "club", "resource", "announcement", "pathway", "checklist"];

interface FlatItem {
  kind: "page" | "entity";
  page?: PageEntry;
  entity?: SearchResultItem;
  key: string;
}

function filterPages(query: string): PageEntry[] {
  if (!query.trim()) return PAGES;
  const q = query.toLowerCase();
  return PAGES.filter((p) => {
    if (p.label.toLowerCase().includes(q)) return true;
    if (p.description.toLowerCase().includes(q)) return true;
    if (p.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
    return false;
  });
}

function groupEntities(items: SearchResultItem[]): Map<SearchResultType, SearchResultItem[]> {
  const map = new Map<SearchResultType, SearchResultItem[]>();
  for (const it of items) {
    const list = map.get(it.type) ?? [];
    list.push(it);
    map.set(it.type, list);
  }
  return map;
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [entities, setEntities] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setEntities([]);
      setActiveIndex(0);
      setSearchError(null);
      const id = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntities([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }
    const controller = new AbortController();
    setIsSearching(true);
    setSearchError(null);
    searchService
      .search({ q: trimmed, limit: 5, signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        setEntities(res.data?.results ?? []);
        setIsSearching(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setEntities([]);
        setIsSearching(false);
        setSearchError("Entity search unavailable");
      });
    return () => controller.abort();
  }, [debouncedQuery, isOpen]);

  const pages = useMemo(() => filterPages(query), [query]);
  const grouped = useMemo(() => groupEntities(entities), [entities]);

  const flatItems: FlatItem[] = useMemo(() => {
    const items: FlatItem[] = [];
    pages.forEach((p) => items.push({ kind: "page", page: p, key: `page:${p.href}` }));
    TYPE_ORDER.forEach((t) => {
      const list = grouped.get(t);
      if (!list) return;
      list.forEach((e) => items.push({ kind: "entity", entity: e, key: `${e.type}:${e.id}` }));
    });
    return items;
  }, [pages, grouped]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [debouncedQuery, entities.length]);

  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  function navigateTo(item: FlatItem) {
    const href = item.kind === "page" ? item.page!.href : item.entity!.url;
    close();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (flatItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) navigateTo(item);
    }
  }

  if (!isOpen) return null;

  let cursor = 0;
  const trimmed = query.trim();
  const showEmpty = trimmed.length > 0 && !isSearching && pages.length === 0 && entities.length === 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        className="relative mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-white shadow-2xl border border-border overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, people, clubs, resources…"
            className="flex-1 h-14 bg-transparent text-base text-primary placeholder:text-muted focus:outline-none"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {isSearching && <Loader2 className="h-4 w-4 text-muted animate-spin shrink-0" aria-hidden="true" />}
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {pages.length > 0 && (
            <div className="mb-1">
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Pages
              </div>
              {pages.map((p) => {
                const idx = cursor++;
                const Icon = p.icon;
                return (
                  <button
                    key={p.href}
                    data-idx={idx}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => navigateTo({ kind: "page", page: p, key: `page:${p.href}` })}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      idx === activeIndex ? "bg-background" : "hover:bg-background/60",
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-primary truncate">{p.label}</span>
                      <span className="text-xs text-muted truncate">{p.description}</span>
                    </span>
                    {idx === activeIndex && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-muted shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {TYPE_ORDER.map((type) => {
            const list = grouped.get(type);
            if (!list || list.length === 0) return null;
            const meta = TYPE_META[type];
            const TypeIcon = meta.icon;
            return (
              <div key={type} className="mb-1">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {meta.label}
                </div>
                {list.map((entity) => {
                  const idx = cursor++;
                  return (
                    <button
                      key={`${entity.type}:${entity.id}`}
                      data-idx={idx}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateTo({ kind: "entity", entity, key: `${entity.type}:${entity.id}` })}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        idx === activeIndex ? "bg-background" : "hover:bg-background/60",
                      )}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border shrink-0">
                        <TypeIcon className="h-4 w-4 text-primary" />
                      </span>
                      <span className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-primary truncate">{entity.title}</span>
                        {entity.subtitle && (
                          <span className="text-xs text-muted truncate">{entity.subtitle}</span>
                        )}
                      </span>
                      {idx === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-muted shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {showEmpty && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-primary">No results for &ldquo;{trimmed}&rdquo;</p>
              <p className="mt-1 text-xs text-muted">
                {searchError ?? "Try a different keyword."}
              </p>
            </div>
          )}

          {trimmed.length === 0 && (
            <div className="px-3 pb-2 pt-1 text-[11px] text-muted">
              Type to search across pages, people, clubs, resources, announcements, and pathways.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-medium">↑↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-medium">↵</kbd>
              open
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-medium">⌘</kbd>
            <kbd className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 font-medium">K</kbd>
            to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
