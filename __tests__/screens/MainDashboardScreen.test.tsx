import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { MainDashboardScreen } from '../../src/screens/MainDashboardScreen';

jest.mock('../../src/components/AdMobBanner', () => ({
  AdMobBanner: () => null,
}));

describe('MainDashboardScreen', () => {
  it('navigates to the engineering menu from the STEM tile', () => {
    const onNavigate = jest.fn();
    const { getByText } = render(<MainDashboardScreen onNavigate={onNavigate} />);

    fireEvent.press(getByText('Engineering').parent!);

    expect(onNavigate).toHaveBeenCalledWith(7);
  });

  it('navigates to the health menu from the MED tile', () => {
    const onNavigate = jest.fn();
    const { getByText } = render(<MainDashboardScreen onNavigate={onNavigate} />);

    fireEvent.press(getByText('Health').parent!);

    expect(onNavigate).toHaveBeenCalledWith(12);
  });
});
