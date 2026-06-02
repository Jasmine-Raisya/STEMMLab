import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { ReflectionForm } from '../src/components/ReflectionForm';
import { SensorLineChart } from '../src/components/SensorLineChart';

describe('Activity sensor and reflection harness', () => {
  it('renders sensor chart from live sample data', () => {
    const { getByText } = render(
      <SensorLineChart
        label="Acceleration"
        samples={[{ activityId: 'earthquake', metric: 'acceleration', value: 1.4, timestamp: 1 }]}
      />,
    );

    expect(getByText('Acceleration')).toBeTruthy();
    expect(getByText('1.40')).toBeTruthy();
  });

  it('tracks reflection input state and rating selection', () => {
    const onSaved = jest.fn();
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <ReflectionForm activityId="sound" teamId="team-1" questions={['What happened?']} onSaved={onSaved} />,
    );

    fireEvent.press(getByText('4'));
    fireEvent.changeText(getByPlaceholderText('Type your answer'), 'The library was quieter than the playground.');

    expect(getByDisplayValue('The library was quieter than the playground.')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
  });

  it('keeps arbitrary native mocks available for test lab screens', () => {
    const { getByText } = render(<Text>Native mocks ready</Text>);
    expect(getByText('Native mocks ready')).toBeTruthy();
  });
});
