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
    <div className="mb-3 z-10 lg:mb-10 lg:w-[1280px] w-[500px] right-[11px] relative lg:right-[24px] lg:bottom-[18px] bottom-[15px] bg-[#ffffff] lg:p-5 p-2">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {breadcrumb && (
        <div className="mt-1 lg:mt-5 ">
          <Breadcrumb items={breadcrumb} />
        </div>
      )}
    </div>
  );
}
