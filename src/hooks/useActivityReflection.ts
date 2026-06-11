import { useEffect, useMemo, useRef, useState } from 'react';

import { deleteExperimentDraft, getExperimentDraft, saveExperimentDraft } from '../services/localDb';
import { submitFinalExperimentRecord } from '../services/syncService';
import { ActivityId } from '../types/models';

export function useActivityReflection(activityId: ActivityId, teamId: string, questions: string[], results?: Record<string, unknown>) {
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
    await submitFinalExperimentRecord({
      activityId,
      teamId,
      rating,
      answers,
      results,
    });
    await deleteExperimentDraft(activityId, teamId);
  };

  return useMemo(() => ({ rating, setRating, answers, updateAnswer, isValid, save }), [answers, isValid, rating]);
}
