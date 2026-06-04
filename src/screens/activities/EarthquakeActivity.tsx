import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { BatteryWarning } from '../../components/BatteryWarning';
import { ReflectionForm } from '../../components/ReflectionForm';
import { SensorLineChart } from '../../components/SensorLineChart';
import { SpeechButton } from '../../components/SpeechButton';
import { useThemeColors } from '../../ThemeContext';
import { useAccelerometerStream } from '../../hooks/useAccelerometerStream';
import { useTeam } from '../../services/teamContext';
import { SensorSample } from '../../types/models';

interface Props {
  onBack: () => void;
}

interface EarthquakeIteration {
  id: string;
  name: string;
  folds: number;
  cups: number;
  peakAcceleration: number;
  averageAcceleration: number;
  samples: number;
}

const instructionImage = require('../../../assets/exp4.jpg');

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function summarizeSamples(samples: SensorSample[]) {
  if (samples.length === 0) return { peakAcceleration: 0, averageAcceleration: 0, samples: 0 };
  const values = samples.map((sample) => sample.value);
  return {
    peakAcceleration: Number(Math.max(...values).toFixed(2)),
    averageAcceleration: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    samples: samples.length,
  };
}

function BuildModeScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const instructions = translatedArray(t('earthquake.instructions', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.buildMode')}</Text>
      <SpeechButton text={[t('earthquake.overview'), ...instructions]} style={s.speech} />
      <Image source={instructionImage} resizeMode="contain" style={s.diagramImage} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('earthquake.overview')}</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('earthquake.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Start Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SeismographScreen({ attempt, onSave }: { attempt: number; onSave: (iteration: EarthquakeIteration) => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [recording, setRecording] = useState(false);
  const [folds, setFolds] = useState('');
  const [cups, setCups] = useState('');
  const stream = useAccelerometerStream({ activityId: 'earthquake', active: recording, threshold: 2.2 });
  const samplesRef = useRef<SensorSample[]>([]);

  useEffect(() => {
    samplesRef.current = stream.samples;
  }, [stream.samples]);

  const foldCount = Number(folds);
  const cupCount = Number(cups);
  const canSave = Number.isFinite(foldCount) && foldCount > 0 && Number.isFinite(cupCount) && cupCount > 0 && samplesRef.current.length > 0;

  const saveIteration = () => {
    if (!canSave) return;
    const summary = summarizeSamples(samplesRef.current);
    onSave({
      id: `${Date.now()}-${attempt}`,
      name: `${foldCount} folds ${cupCount} cups`,
      folds: foldCount,
      cups: cupCount,
      ...summary,
    });
  };

  return (
    <ScrollView style={[s.pad, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent}>
      <Text style={[s.heading, { color: colors.heading }]}>{t('earthquake.seismograph')}</Text>
      <Text style={[s.muted, { color: colors.muted }]}>Name the iteration by entering folds and cups, then record the shake data.</Text>
      <View style={s.buttonRow}>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, { color: colors.heading }]}>Folds</Text>
          <TextInput keyboardType="numeric" onChangeText={(value) => setFolds(value.replace(/[^0-9]/g, ''))} placeholder="4" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={folds} />
        </View>
        <View style={[s.inputGroup, s.flex]}>
          <Text style={[s.label, { color: colors.heading }]}>Paper cups</Text>
          <TextInput keyboardType="numeric" onChangeText={(value) => setCups(value.replace(/[^0-9]/g, ''))} placeholder="6" placeholderTextColor={colors.muted} style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]} value={cups} />
        </View>
      </View>
      <SpeechButton text={t('earthquake.seismographSub')} style={s.speech} />
      <BatteryWarning />
      <SensorLineChart samples={stream.samples} label={t('data.acceleration')} color={stemmColors.green} />
      <TouchableOpacity style={[s.btn, { backgroundColor: recording ? '#C53A2C' : stemmColors.green }]} onPress={() => setRecording(!recording)}>
        <Text style={s.btnText}>{recording ? t('earthquake.stopRecording') : t('earthquake.startRecording')}</Text>
      </TouchableOpacity>
      <View style={[s.status, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.statusLabel, { color: colors.muted }]}>{t('earthquake.recordingStatus')}</Text>
        <Text style={[s.statusText, { color: colors.text }]}>{recording ? t('earthquake.recordingData') : `${stream.samples.length} samples captured`}</Text>
      </View>
      <TouchableOpacity disabled={!canSave} style={[s.btn, !canSave && s.disabled]} onPress={saveIteration}>
        <Text style={s.btnText}>Save Iteration</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PeakDataScreen({ iterations, onCreateNew, onFinish }: { iterations: EarthquakeIteration[]; onCreateNew: () => void; onFinish: () => void }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.peakData')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>Peak data below comes directly from the shake recording in step 2.</Text>
      {iterations.length === 0 ? (
        <View style={s.section}><Text style={s.body}>No iterations recorded yet.</Text></View>
      ) : iterations.map((iteration) => (
        <View key={iteration.id} style={s.card}>
          <Text style={s.cardTitle}>{iteration.name}</Text>
          <Text style={s.body}>{t('data.peakAcceleration')}: {iteration.peakAcceleration} G</Text>
          <Text style={s.body}>Average acceleration: {iteration.averageAcceleration} G</Text>
          <Text style={s.body}>Samples: {iteration.samples}</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onCreateNew}>
        <Text style={s.btnText}>Create Another Iteration</Text>
      </TouchableOpacity>
      {iterations.length > 0 && (
        <TouchableOpacity style={s.outlineBtn} onPress={onFinish}>
          <Text style={s.outlineBtnText}>{t('common.viewLeaderboard')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function LeaderboardScreen({ iterations, onNext }: { iterations: EarthquakeIteration[]; onNext: () => void }) {
  const { team } = useTeam();
  const ranked = [...iterations].sort((a, b) => a.peakAcceleration - b.peakAcceleration);

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{tSafe('Leaderboard')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>Lower peak acceleration means the structure handled the shake better.</Text>
      {ranked.length === 0 && <Text style={s.body}>No synced leaderboard entries yet.</Text>}
      {ranked.map((iteration, index) => (
        <View key={iteration.id} style={s.lbRow}>
          <Text style={s.rank}>{index + 1}</Text>
          <View style={s.flex}>
            <Text style={s.cardTitle}>{iteration.name}</Text>
            <Text style={s.body}>{team?.teamName ?? 'Local team'}</Text>
          </View>
          <Text style={s.score}>{iteration.peakAcceleration} G</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>Complete Reflection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function tSafe(value: string) {
  return value;
}

function ReflectionScreen({ iterations, onBack }: { iterations: EarthquakeIteration[]; onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const fields = translatedArray(t('earthquake.writeUpFields', { returnObjects: true }));
  const iterationFields = iterations.map((iteration) => `Explain why ${iteration.name} recorded ${iteration.peakAcceleration} G peak acceleration.`);

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.reflection')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('earthquake.reflectionSub')}</Text>
      <SpeechButton text={[...fields, ...iterationFields]} style={s.speech} />
      <ReflectionForm activityId="earthquake" teamId={team?.id ?? 'local'} questions={[...fields, ...iterationFields]} onSaved={onBack} />
    </ScrollView>
  );
}

export function EarthquakeActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [iterations, setIterations] = useState<EarthquakeIteration[]>([]);
  const total = 5;

  const saveIteration = (iteration: EarthquakeIteration) => {
    setIterations((previous) => [iteration, ...previous]);
    setStep(3);
  };

  return (
    <View style={s.root}>
      <ActivityHeader title={t('earthquake.title')} step={step} total={total} color={stemmColors.green} onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <BuildModeScreen onNext={() => setStep(2)} />}
        {step === 2 && <SeismographScreen attempt={iterations.length + 1} onSave={saveIteration} />}
        {step === 3 && <PeakDataScreen iterations={iterations} onCreateNew={() => setStep(2)} onFinish={() => setStep(4)} />}
        {step === 4 && <LeaderboardScreen iterations={iterations} onNext={() => setStep(5)} />}
        {step === 5 && <ReflectionScreen iterations={iterations} onBack={onBack} />}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { color: stemmColors.blue, fontSize: 26, fontWeight: '800', marginBottom: 10 },
  speech: { marginBottom: 16 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  diagramImage: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, height: 260, marginBottom: 16, width: '100%' },
  btn: { alignItems: 'center', backgroundColor: stemmColors.green, borderRadius: 14, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineBtn: { alignItems: 'center', borderColor: stemmColors.green, borderRadius: 14, borderWidth: 2, justifyContent: 'center', marginBottom: 8, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14 },
  outlineBtnText: { color: stemmColors.green, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  muted: { fontSize: 16, marginBottom: 16 },
  status: { borderRadius: 14, borderWidth: 1, marginBottom: 8, padding: 14 },
  statusLabel: { fontSize: 16, marginBottom: 6 },
  statusText: { fontSize: 16, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, color: stemmColors.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 },
  disabled: { opacity: 0.45 },
  card: { borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 16 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  lbRow: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 8, padding: 14 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  score: { color: stemmColors.green, fontSize: 18, fontWeight: '900' },
});
