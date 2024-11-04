import { Breadcrumb, BreadcrumbItem, PageBreadcrumb } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const DataContainerBreadcrumb = (props: {
  currentPage?: string;
  parentPage?: string;
  cacheName?: string;
  label?: string;
}) => {
  const { t } = useTranslation();
  const addCacheName = () => {
    if (props.cacheName) {
      return (
        <BreadcrumbItem data-cy="cacheNameLink">
          <Link
            to={{
              pathname: '/cache/' + encodeURIComponent(props.cacheName),
              search: location.search
            }}
          >
            {props.cacheName}
          </Link>
        </BreadcrumbItem>
      );
    }
    return;
  };
  const label = props.label ? props.label : 'cache-managers.title';
  return (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem data-cy={props.parentPage ? props.parentPage + 'Link' : 'dataContainerLink'}>
          <Link
            to={{
              pathname: props.parentPage ? props.parentPage : '/',
              search: location.search
            }}
          >
            {t(label)}
          </Link>
        </BreadcrumbItem>
        {addCacheName()}
        <BreadcrumbItem isActive>{props.currentPage}</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );
};

export { DataContainerBreadcrumb };
