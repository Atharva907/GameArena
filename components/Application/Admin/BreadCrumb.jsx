import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BreadCrumb = ({ breadcrumbData = [] }) => {
  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList className="flex-wrap gap-y-2">
        {breadcrumbData.map((data, index) => {
          const isLastItem = index === breadcrumbData.length - 1;

          return (
            <React.Fragment key={`${data.href}-${data.label}`}>
              <BreadcrumbItem>
                {isLastItem ? (
                  <BreadcrumbPage>{data.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={data.href}>{data.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLastItem && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumb;
