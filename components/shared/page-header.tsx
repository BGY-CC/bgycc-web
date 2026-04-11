import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

/**
 * Consistent page header: large title + breadcrumb below.
 * Used at the top of every dashboard page.
 */
export function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-3">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {breadcrumb && (
        <div className="mt-1">
          <Breadcrumb items={breadcrumb} />
        </div>
      )}
    </div>
  );
}
