import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { ReflectionForm } from '../../components/ReflectionForm';
import { useTeam } from '../../services/teamContext';

interface Props { onBack: () => void; }

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function PhaseSelectionScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const instructions = translatedArray(t('reaction.instructions', { returnObjects: true }));
  const phases = [t('data.tapTest'), t('data.handSwap'), t('data.tracing')];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('reaction.phaseSelection')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('reaction.chooseTest')}</Text>
      <SpeechButton text={[t('reaction.overview'), ...instructions]} style={s.speech} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('reaction.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      {phases.map((phase, index) => (
        <TouchableOpacity key={phase} style={s.phaseCard} activeOpacity={0.8}>
          <View style={s.phaseIcon}><Text style={s.phaseIndex}>{index + 1}</Text></View>
          <Text style={[s.cardTitle, s.flex]}>{phase}</Text>
          <Text style={s.muted}>{t('common.ready')}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.startTest')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TheBoardScreen({ onNext, onResult }: { onNext: () => void; onResult: (timeMs: number) => void }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'waiting' | 'ready' | 'pressed'>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'waiting') {
      timerRef.current = setTimeout(() => {
        readyAtRef.current = Date.now();
        setState('ready');
      }, Math.random() * 2000 + 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);

  const handlePress = () => {
    if (state === 'ready') {
      const nextTime = readyAtRef.current ? Date.now() - readyAtRef.current : 0;
      setReactionTime(nextTime);
      onResult(nextTime);
      setState('pressed');
      setTimeout(() => {
        setState('waiting');
        setReactionTime(null);
        readyAtRef.current = null;
      }, 1500);
    }
  };

  const buttonColor = state === 'ready' ? '#0074D9' : state === 'pressed' ? stemmColors.green : '#E0E0E0';
  const buttonLabel = state === 'waiting' ? t('reaction.wait') : state === 'ready' ? t('reaction.tapNow') : `${reactionTime}ms`;
  const status = state === 'waiting' ? t('reaction.getReady') : state === 'ready' ? t('reaction.go') : t('reaction.greatReaction');

  return (
    <View style={[s.pad, s.flex]}>
      <Text style={s.heading}>{t('reaction.board')}</Text>
      <Text style={[s.body, { marginBottom: 24 }]}>{t('reaction.tapWhenBlue')}</Text>
      <SpeechButton text={t('reaction.tapWhenBlue')} style={s.speech} />
      <View style={s.center}>
        <TouchableOpacity style={[s.bigBtn, { backgroundColor: buttonColor }]} onPress={handlePress} disabled={state !== 'ready'}>
          <Text style={[s.bigBtnText, { color: state === 'waiting' ? stemmColors.muted : '#fff' }]}>{buttonLabel}</Text>
        </TouchableOpacity>
        <Text style={s.status}>{status}</Text>
      </View>
      <TouchableOpacity style={s.outlineBtn} onPress={onNext}>
        <Text style={s.outlineBtnText}>{t('reaction.nextTracing')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TracingPathScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const [tracing, setTracing] = useState(false);

  return (
    <View style={[s.pad, s.flex, { backgroundColor: stemmColors.blue }]}>
      <Text style={[s.heading, { color: '#fff' }]}>{t('reaction.tracingPath')}</Text>
      <Text style={s.darkBody}>{t('reaction.tracingSub')}</Text>
      <View style={s.tracingBox}>
        <Svg width="80%" height="100%" viewBox="0 0 300 400">
          <Path d="M 50 50 Q 250 100, 150 200 T 250 350" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="40" strokeLinecap="round" />
          <Path d="M 50 50 Q 250 100, 150 200 T 250 350" fill="none" stroke="#6EE7B7" strokeWidth="8" strokeLinecap="round" />
          <Circle cx="50" cy="50" r="15" fill="#4CAF50" />
          <Circle cx="250" cy="350" r="15" fill="#F44336" />
        </Svg>
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: tracing ? '#C53A2C' : stemmColors.green }]} onPress={() => setTracing(!tracing)}>
        <Text style={s.btnText}>{tracing ? t('reaction.stopTracing') : t('reaction.startTracing')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.viewHandStats')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function HandStatsScreen({ reactionTimes, onNext }: { reactionTimes: number[]; onNext: () => void }) {
  const { t } = useTranslation();
  const best = reactionTimes.length ? Math.min(...reactionTimes) : null;
  const average = reactionTimes.length
    ? Math.round(reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length)
    : null;
  const rows = [
    `${t('data.tapTest')}: ${best ? `${best}ms` : '-'}`,
    `${t('data.average')}: ${average ? `${average}ms` : '-'}`,
    `${t('data.attempts')}: ${reactionTimes.length}`,
  ];

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('reaction.handStats')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('reaction.handStatsSub')}</Text>
      {rows.map((row) => (
        <View key={row} style={s.card}><Text style={s.cardTitle}>{row}</Text></View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.viewGlobalRank')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function GlobalRankScreen({ bestTime, onNext }: { bestTime: number | null; onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('reaction.globalRank')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('reaction.globalRankSub')}</Text>
      {team && bestTime ? (
        <View style={s.lbRow}>
          <Text style={s.rank}>1</Text>
          <Text style={[s.cardTitle, s.flex]}>{team.teamName}</Text>
          <Text style={s.score}>{bestTime}ms</Text>
        </View>
      ) : (
        <View style={s.card}><Text style={s.cardTitle}>{t('parachute.noIterations')}</Text></View>
      )}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.writeUp')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const fields = translatedArray(t('reaction.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.writeUp')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('reaction.writeSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      <ReflectionForm activityId="reaction" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function ReactionBoardActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const total = 6;
  const bestTime = reactionTimes.length ? Math.min(...reactionTimes) : null;

  return (
    <View style={[s.root, step === 3 && { backgroundColor: stemmColors.blue }]}>
      <ActivityHeader title={t('reaction.title')} step={step} total={total} color="#9C27B0" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <PhaseSelectionScreen onNext={() => setStep(2)} />}
        {step === 2 && <TheBoardScreen onResult={(timeMs) => setReactionTimes((previous) => [...previous.slice(-9), timeMs])} onNext={() => setStep(3)} />}
        {step === 3 && <TracingPathScreen onNext={() => setStep(4)} />}
        {step === 4 && <HandStatsScreen reactionTimes={reactionTimes} onNext={() => setStep(5)} />}
        {step === 5 && <GlobalRankScreen bestTime={bestTime} onNext={() => setStep(6)} />}
        {step === 6 && <WriteUpScreen onBack={onBack} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', color: stemmColors.blue, marginBottom: 10 },
  speech: { marginBottom: 16 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  darkBody: { color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 24, marginBottom: 16 },
  muted: { color: stemmColors.muted, fontSize: 14 },
  section: { backgroundColor: stemmColors.surface, borderRadius: 14, borderWidth: 1, borderColor: stemmColors.border, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  btn: { backgroundColor: stemmColors.blue, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  outlineBtn: { borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  outlineBtnText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800' },
  phaseCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderRadius: 14, borderColor: '#9C27B0', padding: 16, marginBottom: 12 },
  phaseIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' },
  phaseIndex: { color: '#9C27B0', fontSize: 20, fontWeight: '900' },
  card: { borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigBtn: { width: 220, height: 220, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  bigBtnText: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  status: { color: stemmColors.text, fontSize: 18, fontWeight: '800', marginTop: 16 },
  tracingBox: { backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 16, flex: 1, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  score: { color: '#9C27B0', fontSize: 18, fontWeight: '900' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: stemmColors.text, fontSize: 16, minHeight: 80 },
});
