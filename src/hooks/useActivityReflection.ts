import { useEffect, useMemo, useRef, useState } from 'react';

import { deleteExperimentDraft, getExperimentDraft, insertActivityReflection, saveExperimentDraft } from '../services/localDb';
import { syncPendingLocalData } from '../services/syncService';
import { ActivityId } from '../types/models';

export function useActivityReflection(activityId: ActivityId, teamId: string, questions: string[]) {
  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => Object.fromEntries(questions.map((question) => [question, ''])),
  );
  const draftLoadedRef = useRef(false);

  const updateAnswer = (question: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [question]: value }));
  };

  const isValid = rating > 0 && questions.every((question) => answers[question]?.trim().length > 0);

  useEffect(() => {
    let mounted = true;

    async function loadDraft() {
      draftLoadedRef.current = false;
      const draft = await getExperimentDraft(activityId, teamId);
      if (!mounted) return;

      if (draft) {
        if (typeof draft.rating === 'number') setRating(draft.rating);
        if (draft.answers && typeof draft.answers === 'object') {
          setAnswers((previous) => ({ ...previous, ...(draft.answers as Record<string, string>) }));
        }
      }

      draftLoadedRef.current = true;
    }

    void loadDraft();

    return () => {
      mounted = false;
    };
  }, [activityId, teamId]);

  useEffect(() => {
    if (!draftLoadedRef.current) return;
    void saveExperimentDraft(activityId, teamId, { rating, answers });
  }, [activityId, answers, rating, teamId]);

  const save = async () => {
    if (!isValid) throw new Error('Please complete every reflection answer and rating.');
    await insertActivityReflection({
      activityId,
      teamId,
      rating,
      answers,
      timestamp: Date.now(),
    });
    await deleteExperimentDraft(activityId, teamId);
    try {
      await syncPendingLocalData();
    } catch (error) {
      console.warn('Reflection saved locally, but Firestore sync failed.', error);
    }
  };

  return useMemo(() => ({ rating, setRating, answers, updateAnswer, isValid, save }), [answers, isValid, rating]);
}
