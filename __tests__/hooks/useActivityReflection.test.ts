import { act, renderHook } from '@testing-library/react-native';

import { useActivityReflection } from '../../src/hooks/useActivityReflection';
import { insertActivityReflection } from '../../src/services/localDb';
import { syncPendingLocalData } from '../../src/services/syncService';

jest.mock('../../src/services/localDb', () => ({
  insertActivityReflection: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/syncService', () => ({
  syncPendingLocalData: jest.fn(async () => ({ skipped: false, samples: 0, logs: 0, reflections: 1 })),
}));

describe('useActivityReflection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1234);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks answer and rating state until the reflection is valid', () => {
    const { result } = renderHook(() => useActivityReflection('reaction', 'team-1', ['What happened?']));

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.setRating(4);
      result.current.updateAnswer('What happened?', 'I reacted faster after practice.');
    });

    expect(result.current.rating).toBe(4);
    expect(result.current.answers['What happened?']).toBe('I reacted faster after practice.');
    expect(result.current.isValid).toBe(true);
  });

  it('saves a complete reflection to local storage', async () => {
    const { result } = renderHook(() => useActivityReflection('reaction', 'team-1', ['What happened?']));

    act(() => {
      result.current.setRating(5);
      result.current.updateAnswer('What happened?', 'The second trial was smoother.');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(insertActivityReflection).toHaveBeenCalledWith({
      activityId: 'reaction',
      teamId: 'team-1',
      rating: 5,
      answers: { 'What happened?': 'The second trial was smoother.' },
      timestamp: 1234,
    });
    expect(syncPendingLocalData).toHaveBeenCalledTimes(1);
  });
});
