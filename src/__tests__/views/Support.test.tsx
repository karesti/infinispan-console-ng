import { Support } from '@app/Support/Support';
import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../test-utils';

describe('Support page', () => {
  test.only('modal shows the children and a close button', () => {
    const handleClose = jest.fn();

    const { getByRole } = renderWithRouter(<Support isModalOpen={true} closeModal={handleClose} />);

    expect(getByRole('banner', { name: 'support.no-user-label' })).toBeDefined();
    expect(getByRole('heading', { name: 'support.no-user' })).toBeDefined();
    expect(getByRole('heading', { name: 'support.text-create-user' })).toBeDefined();

    fireEvent.click(getByRole('button', { name: 'Close' }));
    fireEvent.click(getByRole('button', { name: 'Reload' }));

    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
