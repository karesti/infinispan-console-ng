import { render } from '@testing-library/react';
import React, { isValidElement } from 'react';
import i18n from './i18n4Test';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

export function renderWithRouter(children, routes = []) {
  const wrapper = (children) => <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;

  const options = isValidElement(children) ? { element: wrapper(children), path: '/' } : children;

  const router = createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: [options.path],
    initialIndex: 1
  });

  return render(
    <RouterProvider
      future={{
        v7_startTransition: true
      }}
      router={router}
    />
  );
}
