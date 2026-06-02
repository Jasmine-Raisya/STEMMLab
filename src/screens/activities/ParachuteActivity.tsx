import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { useTeam } from '../../services/teamContext';
import { saveExperimentRecordLocal } from '../../services/localDb';

interface Props { onBack: () => void; }

interface Iteration {
  attempt: number;
  time: number;
  velocity: number;
  acceleration: number;
  gForce: number;
}

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function OverviewScreen({ onNext, iterations }: { onNext: () => void; iterations: Iteration[] }) {
  const { t } = useTranslation();
  const equipment = translatedArray(t('parachute.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('parachute.instructions', { returnObjects: true }));
  const ttsText = [
    t('parachute.objective'),
    ...instructions,
    t('parachute.discussion'),
  ];

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('parachute.overview')}</Text>
      <SpeechButton text={ttsText} style={styles.speech} />

      {iterations.length > 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('parachute.attempt', { attempt: iterations.length + 1 })}</Text>
          <Text style={styles.noticeText}>{t('parachute.previousAttempts', { count: iterations.length })}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parachute.objectiveTitle')}</Text>
        <Text style={styles.body}>{t('parachute.objective')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parachute.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parachute.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>

      <View style={styles.scienceBox}>
        <Text style={styles.sectionTitle}>{t('parachute.discussionTitle')}</Text>
        <Text style={styles.body}>{t('parachute.discussion')}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>
          {iterations.length > 0 ? t('common.continueIteration') : t('common.startExperiment')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TimerScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);

  return (
    <View style={[styles.pad, styles.flex]}>
      <Text style={styles.heading}>{t('parachute.timer')}</Text>
      <SpeechButton text={t('parachute.timerInstruction')} style={styles.speech} />
      <View style={styles.centerStage}>
        <Text style={styles.timer}>3.47s</Text>
        <Text style={styles.body}>{t('parachute.timerInstruction')}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.primaryButton, styles.flex, { backgroundColor: stemmColors.green }]} onPress={() => setRunning(true)}>
            <Text style={styles.primaryButtonText}>{running ? t('parachute.start') : t('parachute.start')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, styles.flex, { backgroundColor: '#B84A20' }]} onPress={() => setRunning(false)}>
            <Text style={styles.primaryButtonText}>{t('parachute.stop')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.outlineButton} onPress={onNext}>
        <Text style={styles.outlineButtonText}>{t('common.nextStep')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function VideoAnalysisScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const progress = 45;

  return (
    <View style={[styles.pad, styles.flex]}>
      <Text style={styles.heading}>{t('parachute.video')}</Text>
      <SpeechButton text={t('parachute.videoInstruction')} style={styles.speech} />
      <View style={styles.flex}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={[styles.body, { marginBottom: 14 }]}>{t('parachute.videoInstruction')}</Text>
        <View style={styles.timelineLabels}>
          <Text style={styles.muted}>0:00</Text>
          <Text style={styles.muted}>Frame: {Math.floor(progress / 2)}</Text>
          <Text style={styles.muted}>0:03</Text>
        </View>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${progress}%` }]} />
        </View>
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]}>
          <Text style={styles.primaryButtonText}>{t('parachute.markImpact')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.outlineButton} onPress={onNext}>
        <Text style={styles.outlineButtonText}>{t('parachute.calculateResults')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PhysicsCalculatorScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const results = [
    { label: t('data.velocity'), value: '8.6 m/s' },
    { label: t('data.acceleration'), value: '2.48 m/s2' },
    { label: t('data.gForce'), value: '0.25 G' },
  ];

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('parachute.results')}</Text>
      {results.map((result) => (
        <View key={result.label} style={styles.resultCard}>
          <Text style={styles.resultLabel}>{result.label}</Text>
          <Text style={styles.resultValue}>{result.value}</Text>
        </View>
      ))}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parachute.formulaUsed')}</Text>
        <Text style={styles.formula}>{'v = d / t\na = v / t\nG = a / 9.8'}</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('parachute.viewIterations')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function IterationLogScreen({ iterations, onCreateNew, onFinish }: {
  iterations: Iteration[];
  onCreateNew: () => void;
  onFinish: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('parachute.iterationLog')}</Text>
      {iterations.length === 0 ? (
        <View style={[styles.section, styles.center]}>
          <Text style={styles.body}>{t('parachute.noIterations')}</Text>
        </View>
      ) : (
        iterations.map((iteration) => (
          <View key={iteration.attempt} style={styles.iterCard}>
            <Text style={styles.sectionTitle}>{t('parachute.attempt', { attempt: iteration.attempt })}</Text>
            <Text style={styles.body}>
              {t('data.time')}: {iteration.time}s | {t('data.velocity')}: {iteration.velocity} m/s | {t('data.acceleration')}: {iteration.acceleration} m/s2 | {t('data.gForce')}: {iteration.gForce}G
            </Text>
          </View>
        ))
      )}
      <TouchableOpacity style={styles.primaryButton} onPress={onCreateNew}>
        <Text style={styles.primaryButtonText}>{t('parachute.createIteration')}</Text>
      </TouchableOpacity>
      {iterations.length > 0 && (
        <TouchableOpacity style={styles.outlineButton} onPress={onFinish}>
          <Text style={styles.outlineButtonText}>{t('parachute.stopLeaderboard')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function LeaderboardScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const teams = ['Phoenix Innovators', 'Sky Engineers', 'Drop Masters', 'Gravity Squad', 'Air Force One'];

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('parachute.leaderboard')}</Text>
      <Text style={[styles.body, { marginBottom: 14 }]}>{t('parachute.rankedBy')}</Text>
      {teams.map((team, index) => (
        <View key={team} style={[styles.lbRow, index === 0 && styles.lbFirst]}>
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.teamName}>{team}</Text>
            <Text style={styles.muted}>{(3.9 - index * 0.2).toFixed(1)}s {t('data.average')} | {index + 2} {t('data.attempts')}</Text>
          </View>
          {index === 0 && <Text style={styles.teamBadge}>{t('parachute.yourTeam')}</Text>}
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('common.writeSummary')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const fields = translatedArray(t('parachute.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('parachute.writeUp')}</Text>
      <Text style={[styles.body, { marginBottom: 14 }]}>{t('parachute.reflect')}</Text>
      <SpeechButton text={fields} style={styles.speech} />
      {fields.map((field) => (
        <View key={field} style={styles.inputGroup}>
          <Text style={styles.label}>{field}</Text>
          <TextInput style={styles.textarea} multiline editable={false} textAlignVertical="top" />
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={onBack}>
        <Text style={styles.primaryButtonText}>{t('common.completeActivity')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function ParachuteActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const [step, setStep] = useState(1);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [currentIter, setCurrentIter] = useState(1);
  const total = 7;

  const handleCreateIteration = () => {
    const iteration: Iteration = {
      attempt: currentIter,
      time: parseFloat((Math.random() * 2 + 2.5).toFixed(2)),
      velocity: parseFloat((Math.random() * 3 + 7).toFixed(1)),
      acceleration: parseFloat((Math.random() * 1 + 2).toFixed(2)),
      gForce: parseFloat((Math.random() * 0.15 + 0.2).toFixed(2)),
    };
    setIterations((previous) => [...previous, iteration]);
    setCurrentIter((previous) => previous + 1);
    setStep(1);
  };

  const handleCompleteActivity = () => {
    if (team) {
      const avgTime = iterations.length > 0 
        ? parseFloat((iterations.reduce((sum, item) => sum + item.time, 0) / iterations.length).toFixed(2)) 
        : 3.47;

      try {
        saveExperimentRecordLocal({
          id: `parachute_${Date.now()}`,
          teamId: team.teamId,
          activityId: 'parachute',
          score: avgTime,
          timestamp: Date.now(),
          details: {
            attempts: iterations.length,
            runs: iterations,
          }
        });
      } catch (e) {
        console.error('Failed to save parachute experiment to SQLite:', e);
      }
    }
    onBack();
  };

  return (
    <View style={styles.root}>
      <ActivityHeader
        title={iterations.length > 0 ? t('parachute.titleWithAttempt', { attempt: currentIter }) : t('parachute.title')}
        step={step}
        total={total}
        color={stemmColors.orange}
        onBack={step === 1 ? onBack : () => setStep(step - 1)}
      />
      <View style={styles.flex}>
        {step === 1 && <OverviewScreen onNext={() => setStep(2)} iterations={iterations} />}
        {step === 2 && <TimerScreen onNext={() => setStep(3)} />}
        {step === 3 && <VideoAnalysisScreen onNext={() => setStep(4)} />}
        {step === 4 && <PhysicsCalculatorScreen onNext={() => setStep(5)} />}
        {step === 5 && <IterationLogScreen iterations={iterations} onCreateNew={handleCreateIteration} onFinish={() => setStep(6)} />}
        {step === 6 && <LeaderboardScreen onNext={() => setStep(7)} />}
        {step === 7 && <WriteUpScreen onBack={handleCompleteActivity} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: stemmColors.white, flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { color: stemmColors.blue, fontSize: 26, fontWeight: '800', marginBottom: 12 },
  speech: { marginBottom: 16 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  muted: { color: stemmColors.muted, fontSize: 14 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  scienceBox: { backgroundColor: stemmColors.greenSoft, borderColor: '#A9D8C7', borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 16 },
  notice: { backgroundColor: '#FFF4E8', borderColor: stemmColors.orange, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 14 },
  noticeTitle: { color: '#9A4E00', fontSize: 16, fontWeight: '800' },
  noticeText: { color: '#7A4B1F', fontSize: 14, marginTop: 2 },
  primaryButton: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  primaryButtonText: { color: stemmColors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineButton: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  outlineButtonText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  centerStage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  center: { alignItems: 'center' },
  timer: { color: stemmColors.blue, fontSize: 72, fontVariant: ['tabular-nums'], fontWeight: '800', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  videoPlaceholder: { alignItems: 'center', aspectRatio: 16 / 9, backgroundColor: '#102031', borderRadius: 14, justifyContent: 'center', marginBottom: 14 },
  playIcon: { color: '#FFFFFF', fontSize: 48, opacity: 0.72 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  trackBg: { backgroundColor: '#DDE8EE', borderRadius: 5, height: 10, overflow: 'hidden' },
  trackFill: { backgroundColor: stemmColors.orange, borderRadius: 5, height: 10 },
  resultCard: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 16 },
  resultLabel: { color: stemmColors.text, fontSize: 16, fontWeight: '700' },
  resultValue: { color: stemmColors.green, fontSize: 22, fontWeight: '800' },
  formula: { color: stemmColors.text, fontFamily: 'monospace', fontSize: 16, lineHeight: 24 },
  iterCard: { borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14 },
  lbRow: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 14 },
  lbFirst: { backgroundColor: stemmColors.greenSoft, borderColor: stemmColors.green, borderWidth: 2 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  teamName: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  teamBadge: { backgroundColor: stemmColors.green, borderRadius: 12, color: stemmColors.white, fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, color: stemmColors.text, fontSize: 16, minHeight: 86, paddingHorizontal: 14, paddingTop: 12 },
});
