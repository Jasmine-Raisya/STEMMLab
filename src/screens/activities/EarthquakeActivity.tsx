import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';

interface Props { onBack: () => void; }

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function BuildModeScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const instructions = translatedArray(t('earthquake.instructions', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.buildMode')}</Text>
      <SpeechButton text={[t('earthquake.overview'), ...instructions]} style={s.speech} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('parachute.overview')}</Text>
        <Text style={s.body}>{t('earthquake.overview')}</Text>
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('earthquake.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>
      <View style={s.diagramBox}>
        <Svg width="100%" height={180} viewBox="0 0 200 200">
          <Rect x="40" y="170" width="120" height="10" fill="#8B4513" />
          <Rect x="45" y="150" width="110" height="20" fill="#4CAF50" opacity="0.6" />
          <SvgText x="100" y="163" textAnchor="middle" fontSize="8" fill="#2F3E46">Base</SvgText>
          <Rect x="50" y="100" width="100" height="50" fill="#2196F3" opacity="0.4" />
          <SvgText x="100" y="128" textAnchor="middle" fontSize="8" fill="#2F3E46">Frame</SvgText>
          <Rect x="55" y="80" width="90" height="20" fill="#FF9800" opacity="0.6" />
          <SvgText x="100" y="93" textAnchor="middle" fontSize="8" fill="#2F3E46">Dampener</SvgText>
        </Svg>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('earthquake.startTest')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SeismographScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [wave, setWave] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setWave((previous) => [...previous, Math.sin(previous.length * 0.2) * 30 + Math.random() * 10].slice(-60));
      }, 50);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const points = wave.map((y, index) => `${(index / 60) * 300},${75 - y}`).join(' ');

  return (
    <View style={[s.pad, s.flex, s.darkScreen]}>
      <Text style={[s.heading, s.darkText]}>{t('earthquake.seismograph')}</Text>
      <Text style={s.darkMuted}>{t('earthquake.seismographSub')}</Text>
      <SpeechButton text={t('earthquake.seismographSub')} style={s.speech} />
      <View style={s.darkPanel}>
        <Svg width="100%" height={150} viewBox="0 0 300 150">
          <Line x1="0" y1="75" x2="300" y2="75" stroke="rgba(76,175,80,0.3)" strokeWidth="1" />
          {wave.length > 1 && <Polyline points={points} fill="none" stroke="#4CAF50" strokeWidth="2" />}
        </Svg>
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: recording ? '#C53A2C' : stemmColors.green }]} onPress={() => setRecording(!recording)}>
        <Text style={s.btnText}>{recording ? t('earthquake.stopRecording') : t('earthquake.startRecording')}</Text>
      </TouchableOpacity>
      <View style={s.darkStatus}>
        <Text style={s.darkMuted}>{t('earthquake.recordingStatus')}</Text>
        <Text style={s.darkText}>{recording ? t('earthquake.recordingData') : t('earthquake.readyToRecord')}</Text>
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.viewResults')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PeakDataScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.peakData')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('earthquake.peakSub')}</Text>
      {[`${t('data.maxDisplacement')}: 3.2 mm`, `${t('data.stabilityDuration')}: 8.4 s`, `${t('data.peakAcceleration')}: 0.42 G`].map((item) => (
        <View key={item} style={s.card}><Text style={s.cardTitle}>{item}</Text></View>
      ))}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('earthquake.performanceAnalysis')}</Text>
        <BulletList items={['Low displacement indicates a strong structure.', 'Good stability duration shows effective dampening.', 'Consider adding mass to reduce acceleration.']} />
      </View>
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('common.viewLeaderboard')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LeaderboardScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('common.leaderboard')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('earthquake.rankedBy')}</Text>
      {['Phoenix Innovators', 'Tech Titans', 'Build Masters', 'Quake Squad'].map((team, index) => (
        <View key={team} style={s.lbRow}>
          <Text style={s.rank}>{index + 1}</Text>
          <Text style={[s.cardTitle, s.flex]}>{team}</Text>
          <Text style={s.score}>{(3.2 + index * 0.5).toFixed(1)}mm</Text>
        </View>
      ))}
      <TouchableOpacity style={s.btn} onPress={onNext}>
        <Text style={s.btnText}>{t('earthquake.completeReflect')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ReflectionScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const fields = translatedArray(t('earthquake.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={s.pad} contentContainerStyle={s.scrollContent}>
      <Text style={s.heading}>{t('earthquake.reflection')}</Text>
      <Text style={[s.body, { marginBottom: 16 }]}>{t('earthquake.reflectionSub')}</Text>
      <SpeechButton text={fields} style={s.speech} />
      {fields.map((field) => (
        <View key={field} style={s.inputGroup}>
          <Text style={s.label}>{field}</Text>
          <TextInput style={s.textarea} multiline editable={false} textAlignVertical="top" />
        </View>
      ))}
      <Text style={[s.label, { textAlign: 'center' }]}>{t('earthquake.funRating')}</Text>
      <Text style={s.stars}>★★★★★</Text>
      <TouchableOpacity style={s.btn} onPress={onBack}>
        <Text style={s.btnText}>{t('common.completeActivity')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function EarthquakeActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const total = 5;

  return (
    <View style={[s.root, step === 2 && s.darkScreen]}>
      <ActivityHeader title={t('earthquake.title')} step={step} total={total} color={stemmColors.green} onBack={step === 1 ? onBack : () => setStep(step - 1)} />
      <View style={s.flex}>
        {step === 1 && <BuildModeScreen onNext={() => setStep(2)} />}
        {step === 2 && <SeismographScreen onNext={() => setStep(3)} />}
        {step === 3 && <PeakDataScreen onNext={() => setStep(4)} />}
        {step === 4 && <LeaderboardScreen onNext={() => setStep(5)} />}
        {step === 5 && <ReflectionScreen onBack={onBack} />}
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
  section: { backgroundColor: stemmColors.surface, borderRadius: 14, borderWidth: 1, borderColor: stemmColors.border, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  diagramBox: { borderRadius: 14, overflow: 'hidden', marginBottom: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  btn: { backgroundColor: stemmColors.green, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  darkScreen: { backgroundColor: '#1a1a2e' },
  darkText: { color: '#fff' },
  darkMuted: { color: 'rgba(255,255,255,0.68)', fontSize: 16, marginBottom: 16 },
  darkPanel: { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 14, marginBottom: 14 },
  darkStatus: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: stemmColors.border, borderRadius: 14, padding: 14, marginBottom: 8 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  score: { color: stemmColors.green, fontSize: 18, fontWeight: '900' },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingTop: 10, backgroundColor: '#f9fafb', color: stemmColors.text, fontSize: 16, minHeight: 80 },
  stars: { color: '#EAB308', fontSize: 36, letterSpacing: 0, textAlign: 'center', marginBottom: 20 },
});
