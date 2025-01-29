import { render, screen } from '@testing-library/react';
import BoardLoader from '../../../src/components/common/BoardLoader/BoardLoader';

describe('BoardLoader', () => {
  it('should render skeletons', () => {
    render(<BoardLoader />);

    const skeletons = screen.getAllByLabelText(/skeleton/i);

    expect(skeletons.length).toBeGreaterThan(0);
  });
});
