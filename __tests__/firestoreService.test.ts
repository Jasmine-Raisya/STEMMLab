// __tests__/firestoreService.test.ts

// Mock firebase/firestore module with jest.fn implementations
jest.mock('firebase/firestore', () => {
  const mockSetDoc = jest.fn(() => Promise.resolve());
  const mockGetDocs = jest.fn();
  const mockCollection = jest.fn(() => ({}));
  const mockDoc = jest.fn(() => ({}));
  const mockQuery = jest.fn(() => ({}));
  const mockWhere = jest.fn(() => ({}));
  const mockLimit = jest.fn(() => ({}));
  const mockServerTimestamp = jest.fn(() => ({ _placeholder: 'serverTimestamp' }));
  return {
    setDoc: mockSetDoc,
    getDocs: mockGetDocs,
    collection: mockCollection,
    doc: mockDoc,
    query: mockQuery,
    where: mockWhere,
    limit: mockLimit,
    serverTimestamp: mockServerTimestamp,
    // expose mocks for assertions
    __mocks__: { mockSetDoc, mockGetDocs, mockCollection, mockDoc, mockQuery, mockWhere, mockLimit },
  };
});

// Import after mocking so the service uses mocked functions
import { syncExperimentRecords, fetchExperimentRecordsForTeam } from '../src/services/firestoreService';
import { ExperimentRecord } from '../src/types/models';

// Mock firebase config
jest.mock('../src/services/firebaseConfig', () => ({
  firestore: {},
  isFirebaseConfigured: true,
}));

// Retrieve mocks for use in tests
const { __mocks__: allMocks } = require('firebase/firestore');
const { mockSetDoc, mockGetDocs, mockCollection, mockDoc, mockQuery, mockWhere, mockLimit } = allMocks;

describe('Experiment records sync and fetch', () => {
  const sampleRecord: ExperimentRecord = {
    id: 'team1_reflection_activity1_123456',
    teamId: 'team1',
    activityId: 'activity1',
    score: 85,
    timestamp: 1717550400000,
    details: { type: 'reflection', rating: 5, answers: {} },
    authUid: 'uid123',
    representativeEmail: 'team@example.com',
    teamName: 'Team One',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('syncExperimentRecords calls setDoc for each record', async () => {
    await syncExperimentRecords([sampleRecord]);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const callArgs = mockSetDoc.mock.calls[0] as unknown[];
    expect(callArgs).toBeDefined();
    const payload = callArgs[1] as any;
    expect(payload.id).toBe(sampleRecord.id);
    expect(payload.teamId).toBe(sampleRecord.teamId);
    expect(payload.syncedAt).toBeDefined();
    expect(payload.updatedAt).toBeDefined();
  });

  test('fetchExperimentRecordsForTeam returns records sorted by timestamp', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { data: () => ({ ...sampleRecord, timestamp: 2000 }) },
        { data: () => ({ ...sampleRecord, timestamp: 1000 }) },
      ],
    });
    const results = await fetchExperimentRecordsForTeam('team1', 10);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(2);
    expect(results[0].timestamp).toBeGreaterThan(results[1].timestamp);
    expect(results[0].teamId).toBe('team1');
  });
});
