import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { MainDashboardScreen } from '../../src/screens/MainDashboardScreen';

describe('MainDashboardScreen', () => {
  it('renders dashboard paths and navigates to key screens', () => {
    const onNavigate = jest.fn();
    const { getByText, getByTestId } = render(<MainDashboardScreen onNavigate={onNavigate} />);

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Engineering')).toBeTruthy();
    expect(getByText('Health')).toBeTruthy();

    fireEvent.press(getByTestId('dashboard_engineering_button'));
    fireEvent.press(getByTestId('dashboard_health_button'));
    fireEvent.press(getByTestId('dashboard_team_profile_button'));
    fireEvent.press(getByTestId('dashboard_settings_button'));

    expect(onNavigate).toHaveBeenCalledWith(7);
    expect(onNavigate).toHaveBeenCalledWith(12);
    expect(onNavigate).toHaveBeenCalledWith(5);
    expect(onNavigate).toHaveBeenCalledWith(6);
  });

  it('renders the configured AdMob banner container', () => {
    const { getByTestId } = render(<MainDashboardScreen onNavigate={jest.fn()} />);

    expect(getByTestId('admob_banner')).toBeTruthy();
  });
});
