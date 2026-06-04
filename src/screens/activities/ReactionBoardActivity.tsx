import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SpeechButton } from '../../components/SpeechButton';
import { useTeam } from '../../services/teamContext';
import { useThemeColors } from '../../ThemeContext';

interface Props {
  onBack: () => void;
}

type Hand = 'Left' | 'Right';

interface ReactionLog {
  hand: Hand;
  timeMs: number;
  timestamp: number;
}

interface TracePoint {
  x: number;
  y: number;
}

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function pathPoint(t: number) {
  if (t <= 0.5) {
    const u = t / 0.5;
    const x = (1 - u) ** 2 * 50 + 2 * (1 - u) * u * 250 + u ** 2 * 150;
    const y = (1 - u) ** 2 * 50 + 2 * (1 - u) * u * 100 + u ** 2 * 200;
    return { x, y };
  }
  const u = (t - 0.5) / 0.5;
  const x = (1 - u) ** 2 * 150 + 2 * (1 - u) * u * 50 + u ** 2 * 250;
  const y = (1 - u) ** 2 * 200 + 2 * (1 - u) * u * 300 + u ** 2 * 350;
  return { x, y };
}

const targetSamples = Array.from({ length: 80 }, (_, index) => pathPoint(index / 79));

function distanceToTarget(point: TracePoint) {
  return Math.min(...targetSamples.map((target) => Math.hypot(point.x - target.x, point.y - target.y)));
}

function traceAccuracy(points: TracePoint[]) {
  if (points.length < 4) return 0;
  const averageDistance = points.reduce((sum, point) => sum + distanceToTarget(point), 0) / points.length;
  return Math.max(0, Math.min(100, Math.round(100 - averageDistance * 2.2)));
}

function PhaseSelectionScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const instructions = translatedArray(t('reaction.instructions', { returnObjects: true }));
  const phases = [t('data.tapTest'), t('data.handSwap'), t('data.tracing')];

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('reaction.phaseSelection')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.chooseTest')}</Text>
      <SpeechButton text={[t('reaction.overview'), ...instructions]} style={s.speech} />
      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.heading }]}>{t('reaction.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      {phases.map((phase, index) => (
        <View key={phase} style={[s.phaseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.phaseIcon}><Text style={s.phaseIndex}>{index + 1}</Text></View>
          <Text style={[s.cardTitle, s.flex, { color: colors.text }]}>{phase}</Text>
          <Text style={[s.muted, { color: colors.muted }]}>{t('common.ready')}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.startTest')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TheBoardScreen({ onNext, logs, onResult }: { onNext: () => void; logs: ReactionLog[]; onResult: (log: ReactionLog) => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [selectedHand, setSelectedHand] = useState<Hand>('Right');
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'pressed'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyAtRef = useRef<number | null>(null);
  const handLogs = logs.filter((log) => log.hand === selectedHand).slice(-5).reverse();

  const armRound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setReactionTime(null);
    setState('waiting');
    timerRef.current = setTimeout(() => {
      readyAtRef.current = Date.now();
      setState('ready');
    }, Math.random() * 2000 + 1000);
  };

  const handlePress = () => {
    if (state !== 'ready') return;
    const nextTime = readyAtRef.current ? Date.now() - readyAtRef.current : 0;
    const log = { hand: selectedHand, timeMs: nextTime, timestamp: Date.now() };
    setReactionTime(nextTime);
    onResult(log);
    setState('pressed');
    readyAtRef.current = null;
  };

  const buttonColor = state === 'ready' ? '#0074D9' : state === 'pressed' ? stemmColors.green : colors.surface;
  const buttonLabel = state === 'idle' ? 'Start' : state === 'waiting' ? t('reaction.wait') : state === 'ready' ? t('reaction.tapNow') : `${reactionTime}ms`;
  const status = state === 'idle' ? 'Choose a hand, then start.' : state === 'waiting' ? t('reaction.getReady') : state === 'ready' ? t('reaction.go') : t('reaction.greatReaction');

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.boardContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('reaction.board')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.tapWhenBlue')}</Text>
      <View style={[s.handToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['Left', 'Right'] as Hand[]).map((hand) => (
          <TouchableOpacity key={hand} style={[s.handBtn, selectedHand === hand && { backgroundColor: colors.cta }]} onPress={() => setSelectedHand(hand)}>
            <Text style={[s.handText, { color: selectedHand === hand ? colors.ctaText : colors.text }]}>{hand}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.centerBlock}>
        <TouchableOpacity
          style={[s.bigBtn, { backgroundColor: buttonColor, borderColor: colors.border }]}
          onPress={state === 'idle' || state === 'pressed' ? armRound : handlePress}
          disabled={state === 'waiting'}
        >
          <Text style={[s.bigBtnText, { color: state === 'ready' || state === 'pressed' ? '#fff' : colors.text }]}>{buttonLabel}</Text>
        </TouchableOpacity>
        <Text style={[s.status, { color: colors.text }]}>{status}</Text>
      </View>
      <View style={[s.logPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.cardTitle, { color: colors.text }]}>{selectedHand} hand logs</Text>
        {handLogs.length === 0 ? (
          <Text style={[s.muted, { color: colors.muted }]}>No taps recorded yet.</Text>
        ) : (
          handLogs.map((log, index) => (
            <Text key={`${log.timestamp}-${index}`} style={[s.logText, { color: colors.text }]}>
              {index + 1}. {log.timeMs}ms
            </Text>
          ))
        )}
      </View>
      <TouchableOpacity style={s.outlineBtn} onPress={onNext}>
        <Text style={s.outlineBtnText}>{t('reaction.nextTracing')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TracingPathScreen({ onNext, onTraceResult }: { onNext: () => void; onTraceResult: (accuracy: number) => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [box, setBox] = useState({ width: 1, height: 1 });
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const toSvgPoint = (x: number, y: number) => ({
    x: Math.max(0, Math.min(300, (x / box.width) * 300)),
    y: Math.max(0, Math.min(400, (y / box.height) * 400)),
  });

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setAccuracy(null);
      const { locationX, locationY } = event.nativeEvent;
      setPoints([toSvgPoint(locationX, locationY)]);
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const next = toSvgPoint(locationX, locationY);
      setPoints((previous) => [...previous.slice(-179), next]);
    },
    onPanResponderRelease: () => {
      setPoints((current) => {
        const nextAccuracy = traceAccuracy(current);
        setAccuracy(nextAccuracy);
        onTraceResult(nextAccuracy);
        return current;
      });
    },
  }), [box.height, box.width, onTraceResult]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width: Math.max(1, width), height: Math.max(1, height) });
  };

  return (
    <View style={[s.pad, s.flex, { backgroundColor: colors.background }]}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('reaction.tracingPath')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.tracingSub')}</Text>
      <View style={[s.tracingBox, { backgroundColor: colors.surface, borderColor: colors.border }]} onLayout={handleLayout} {...panResponder.panHandlers}>
        <Svg width="100%" height="100%" viewBox="0 0 300 400">
          <Path d="M 50 50 Q 250 100, 150 200 T 250 350" fill="none" stroke="rgba(207,196,107,0.28)" strokeWidth="48" strokeLinecap="round" />
          <Path d="M 50 50 Q 250 100, 150 200 T 250 350" fill="none" stroke={stemmColors.green} strokeWidth="8" strokeLinecap="round" />
          {points.length > 1 && <Polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={colors.cta} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />}
          <Circle cx="50" cy="50" r="15" fill="#4CAF50" />
          <Circle cx="250" cy="350" r="15" fill="#F44336" />
        </Svg>
      </View>
      <View style={[s.logPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.cardTitle, { color: colors.text }]}>Tracing accuracy</Text>
        <Text style={[s.score, { color: colors.cta }]}>{accuracy === null ? '-' : `${accuracy}%`}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={() => { setPoints([]); setAccuracy(null); }}>
        <Text style={s.btnText}>Reset Trace</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.viewHandStats')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function HandStatsScreen({ logs, traceAccuracyValue, onNext }: { logs: ReactionLog[]; traceAccuracyValue: number | null; onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const hands: Hand[] = ['Left', 'Right'];

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('reaction.handStats')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.handStatsSub')}</Text>
      {hands.map((hand) => {
        const handLogs = logs.filter((log) => log.hand === hand);
        const best = handLogs.length ? Math.min(...handLogs.map((log) => log.timeMs)) : null;
        const average = handLogs.length ? Math.round(handLogs.reduce((sum, log) => sum + log.timeMs, 0) / handLogs.length) : null;
        return (
          <View key={hand} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.text }]}>{hand} hand</Text>
            <Text style={[s.muted, { color: colors.muted }]}>Best: {best ? `${best}ms` : '-'} | Average: {average ? `${average}ms` : '-'} | Attempts: {handLogs.length}</Text>
          </View>
        );
      })}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.cardTitle, { color: colors.text }]}>Tracing</Text>
        <Text style={[s.muted, { color: colors.muted }]}>Accuracy: {traceAccuracyValue === null ? '-' : `${traceAccuracyValue}%`}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('reaction.viewGlobalRank')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function GlobalRankScreen({ logs, onNext }: { logs: ReactionLog[]; onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const colors = useThemeColors();
  const bestTime = logs.length ? Math.min(...logs.map((log) => log.timeMs)) : null;

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('reaction.globalRank')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.globalRankSub')}</Text>
      {team && bestTime ? (
        <View style={[s.lbRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.rank, { color: colors.heading }]}>1</Text>
          <Text style={[s.cardTitle, s.flex, { color: colors.text }]}>{team.teamName}</Text>
          <Text style={s.score}>{bestTime}ms</Text>
        </View>
      ) : (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[s.cardTitle, { color: colors.text }]}>{t('parachute.noIterations')}</Text></View>
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
  const colors = useThemeColors();
  const fields = translatedArray(t('reaction.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('common.writeUp')}</Text>
      <Text style={[s.body, { color: colors.text, marginBottom: 16 }]}>{t('reaction.writeSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      <ReflectionForm activityId="reaction" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function ReactionBoardActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [logs, setLogs] = useState<ReactionLog[]>([]);
  const [traceAccuracyValue, setTraceAccuracyValue] = useState<number | null>(null);
  const total = 6;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ActivityHeader title={t('reaction.title')} step={step} total={total} color="#9C27B0" onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <PhaseSelectionScreen onNext={() => setStep(2)} />}
        {step === 2 && <TheBoardScreen logs={logs} onResult={(log) => setLogs((previous) => [...previous.slice(-19), log])} onNext={() => setStep(3)} />}
        {step === 3 && <TracingPathScreen onTraceResult={setTraceAccuracyValue} onNext={() => setStep(4)} />}
        {step === 4 && <HandStatsScreen logs={logs} traceAccuracyValue={traceAccuracyValue} onNext={() => setStep(5)} />}
        {step === 5 && <GlobalRankScreen logs={logs} onNext={() => setStep(6)} />}
        {step === 6 && <WriteUpScreen onBack={onBack} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  boardContent: { flexGrow: 1, paddingBottom: 32 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 10 },
  speech: { marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 24 },
  muted: { fontSize: 14 },
  section: { borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  btn: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  outlineBtn: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  outlineBtnText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800' },
  phaseCard: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 14, marginBottom: 12, padding: 16 },
  phaseIcon: { alignItems: 'center', backgroundColor: '#F3E5F5', borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  phaseIndex: { color: '#9C27B0', fontSize: 20, fontWeight: '900' },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  handToggle: { borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, marginBottom: 18, padding: 6 },
  handBtn: { alignItems: 'center', borderRadius: 10, flex: 1, paddingVertical: 12 },
  handText: { fontSize: 16, fontWeight: '900' },
  centerBlock: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bigBtn: { alignItems: 'center', borderRadius: 28, borderWidth: 1, height: 220, justifyContent: 'center', width: 220 },
  bigBtnText: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  status: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  logPanel: { borderRadius: 14, borderWidth: 1, marginBottom: 12, padding: 14 },
  logText: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  tracingBox: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flex: 1, justifyContent: 'center', marginBottom: 12, minHeight: 360, overflow: 'hidden' },
  lbRow: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  rank: { fontSize: 22, fontWeight: '900', width: 32 },
  score: { color: '#9C27B0', fontSize: 24, fontWeight: '900' },
});
