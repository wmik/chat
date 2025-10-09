import { Fragment, type ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';

type CrumbItem = {
  id?: string;
  children: ReactNode;
  href: string;
};

export type CrumbsProps = {
  data: CrumbItem[];
};

export function Crumbs({ data }: CrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {data?.map((item, idx) => (
          <Fragment key={idx}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={item.href ?? '#'}>
                {item?.children}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {data?.length > 1 && idx < data?.length - 1 ? (
              <BreadcrumbSeparator className="hidden md:block" />
            ) : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
