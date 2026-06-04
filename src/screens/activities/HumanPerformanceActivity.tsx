import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { SensorLineChart } from '../../components/SensorLineChart';
import { BatteryWarning } from '../../components/BatteryWarning';
import { useGyroscopeStream } from '../../hooks/useGyroscopeStream';
import { ReflectionForm } from '../../components/ReflectionForm';
import { useTeam } from '../../services/teamContext';

interface Props { onBack: () => void; }

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function MovementMenuScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const equipment = translatedArray(t('humanPerformance.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('humanPerformance.instructions', { returnObjects: true }));
  const movements = [
    { key: 'slowReach', color: stemmColors.green },
    { key: 'touchToes', color: stemmColors.orange },
    { key: 'sideStretch', color: '#1D76B8' },
  ];

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('humanPerformance.movementMenu')}</Text>
      <Text style={styles.body}>{t('humanPerformance.selectMovement')}</Text>
      <SpeechButton
        text={[t('humanPerformance.overview'), ...instructions, t('humanPerformance.tip')]}
        style={styles.speech}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('humanPerformance.overviewTitle')}</Text>
        <Text style={styles.body}>{t('humanPerformance.overview')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('humanPerformance.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('humanPerformance.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>

      {movements.map((movement) => (
        <TouchableOpacity key={movement.key} style={[styles.movCard, { borderColor: movement.color }]} activeOpacity={0.8}>
          <View style={[styles.movIcon, { backgroundColor: `${movement.color}22` }]}>
            <Text style={[styles.movInitial, { color: movement.color }]}>
              {t(`humanPerformance.movements.${movement.key}.name`).slice(0, 2)}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{t(`humanPerformance.movements.${movement.key}.name`)}</Text>
            <Text style={styles.muted}>{t(`humanPerformance.movements.${movement.key}.description`)}</Text>
          </View>
          <Text style={[styles.badge, { backgroundColor: movement.color }]}>
            {t(`humanPerformance.movements.${movement.key}.difficulty`)}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.tipBox}>
        <Text style={styles.sectionTitle}>{t('humanPerformance.tipTitle')}</Text>
        <Text style={styles.body}>{t('humanPerformance.tip')}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('humanPerformance.beginAnalysis')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SmoothnessTrackerScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const [smoothness, setSmoothness] = useState(0);
  const [tracking, setTracking] = useState(false);
  const movement = t('humanPerformance.movements.slowReach.name');
  const stream = useGyroscopeStream('humanPerformance', tracking);

  useEffect(() => {
    if (!tracking || stream.samples.length === 0) {
      if (!tracking) setSmoothness(0);
      return;
    }
    const latest = stream.samples.at(-1)?.value ?? 0;
    setSmoothness(Math.max(0, Math.min(100, 100 - latest * 30)));
  }, [stream.samples, tracking]);

  const color = smoothness < 40 ? '#C53A2C' : smoothness < 70 ? stemmColors.orange : stemmColors.green;
  const status = smoothness < 40 ? t('humanPerformance.jerky') : smoothness < 70 ? t('humanPerformance.moderate') : t('humanPerformance.smooth');

  return (
    <View style={[styles.pad, styles.flex]}>
      <Text style={styles.heading}>{t('humanPerformance.smoothnessTracker')}</Text>
      <Text style={[styles.body, { marginBottom: 14 }]}>{t('humanPerformance.performing', { movement })}</Text>
      <SpeechButton text={t('humanPerformance.instructions', { returnObjects: true }) as string[]} style={styles.speech} />
      <View style={styles.centerStage}>
        <View style={styles.vertBarBg}>
          <View style={[styles.vertBarFill, { backgroundColor: color, height: `${smoothness}%` as `${number}%` }]} />
        </View>
        <Text style={[styles.percent, { color }]}>{Math.round(smoothness)}%</Text>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tracking ? '#C53A2C' : stemmColors.green, paddingHorizontal: 32 }]}
          onPress={() => setTracking(!tracking)}
        >
          <Text style={styles.primaryButtonText}>{tracking ? t('humanPerformance.stopTracking') : t('humanPerformance.startMovement')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.outlineButton} onPress={onNext}>
        <Text style={styles.outlineButtonText}>{t('humanPerformance.viewSensorData')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function LiveSensorFeedScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const stream = useGyroscopeStream('humanPerformance', true);

  return (
    <View style={[styles.pad, styles.flex]}>
      <Text style={styles.heading}>{t('humanPerformance.sensorFeed')}</Text>
      <Text style={[styles.body, { marginBottom: 16 }]}>{t('humanPerformance.sensorInstruction')}</Text>
      <SpeechButton text={t('humanPerformance.sensorInstruction')} style={styles.speech} />
      <BatteryWarning />
      <SensorLineChart samples={stream.samples} label={t('data.amplitude')} color="#6EE7B7" />
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{t('humanPerformance.movementQuality')}</Text>
          <Text style={[styles.cardTitle, { color: stemmColors.green }]}>{t('humanPerformance.excellent')}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={styles.barFill} />
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('humanPerformance.calculateScore')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PerformanceSummaryScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const score = 87;
  const circumference = 2 * Math.PI * 85;
  const dashArray = `${(score / 100) * circumference} ${circumference}`;
  const stats = [
    { label: t('humanPerformance.steadiness'), value: '92/100' },
    { label: t('humanPerformance.rangeOfMotion'), value: '82/100' },
    { label: t('humanPerformance.consistency'), value: '87/100' },
  ];

  return (
    <View style={[styles.pad, styles.flex]}>
      <Text style={styles.heading}>{t('humanPerformance.performanceSummary')}</Text>
      <View style={styles.centerStage}>
        <View style={styles.scoreWrap}>
          <Svg width={220} height={220} viewBox="0 0 200 200" style={styles.scoreSvg as never}>
            <Circle cx="100" cy="100" r="85" fill="none" stroke="#DDE8EE" strokeWidth="18" />
            <Circle cx="100" cy="100" r="85" fill="none" stroke={stemmColors.green} strokeWidth="18" strokeLinecap="round" strokeDasharray={dashArray} />
          </Svg>
          <View style={styles.scoreCopy}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.muted}>{t('humanPerformance.outOf100')}</Text>
          </View>
        </View>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statRow}>
            <Text style={styles.cardTitle}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('humanPerformance.compareTeam')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function TeamComparisonScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const members = (team?.members ?? []).map((name, index) => ({ name, score: 80 - index * 3 }));

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('humanPerformance.teamComparison')}</Text>
      <Text style={[styles.body, { marginBottom: 16 }]}>{t('humanPerformance.sideBySide')}</Text>
      {members.length === 0 && <Text style={styles.body}>Register team members to compare results.</Text>}
      <View style={styles.barChart}>
        {members.map((member) => (
          <View key={member.name} style={styles.chartColumn}>
            <View style={[styles.chartBar, { height: member.score * 1.45 }]} />
            <Text style={styles.statValue}>{member.score}</Text>
            <Text style={styles.muted}>{member.name}</Text>
          </View>
        ))}
      </View>
      {members.map((member) => (
        <View key={member.name} style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{member.name.split(' ').map((name) => name[0]).join('')}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{member.name}</Text>
            <Text style={styles.muted}>{t('humanPerformance.movements.slowReach.name')}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statValue}>{member.score}</Text>
            <Text style={styles.muted}>{t('data.score')}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('common.writeSummary')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LeaderboardScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const data = team?.members ?? [];

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('humanPerformance.leaderboard')}</Text>
      <Text style={[styles.body, { marginBottom: 16 }]}>{t('humanPerformance.topPerformers')}</Text>
      {data.length === 0 && <Text style={styles.body}>No synced leaderboard entries yet.</Text>}
      {data.map((name, index) => (
        <View key={name} style={[styles.memberCard, index === 0 && styles.lbFirst]}>
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Text style={styles.muted}>{t('humanPerformance.movements.slowReach.name')}</Text>
          </View>
          <Text style={styles.statValue}>{87 - index * 5}</Text>
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
  const { team } = useTeam();
  const fields = translatedArray(t('humanPerformance.writeUpFields', { returnObjects: true }));

  return (
    <ScrollView style={styles.pad} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>{t('humanPerformance.writeUp')}</Text>
      <Text style={[styles.body, { marginBottom: 14 }]}>{t('humanPerformance.documentFindings')}</Text>
      <SpeechButton text={fields} style={styles.speech} />
      <ReflectionForm activityId="humanPerformance" teamId={team?.id ?? 'local'} questions={fields} onSaved={onBack} />
    </ScrollView>
  );
}

export function HumanPerformanceActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const total = 7;

  return (
    <View style={styles.root}>
      <ActivityHeader
        title={t('humanPerformance.title')}
        step={step}
        total={total}
        color={stemmColors.green}
        onBack={step === 1 ? onBack : () => setStep(step - 1)}
      />
      <View style={styles.flex}>
        {step === 1 && <MovementMenuScreen onNext={() => setStep(2)} />}
        {step === 2 && <SmoothnessTrackerScreen onNext={() => setStep(3)} />}
        {step === 3 && <LiveSensorFeedScreen onNext={() => setStep(4)} />}
        {step === 4 && <PerformanceSummaryScreen onNext={() => setStep(5)} />}
        {step === 5 && <TeamComparisonScreen onNext={() => setStep(6)} />}
        {step === 6 && <LeaderboardScreen onNext={() => setStep(7)} />}
        {step === 7 && <WriteUpScreen onBack={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: stemmColors.white, flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  heading: { color: stemmColors.blue, fontSize: 26, fontWeight: '800', marginBottom: 10 },
  speech: { marginBottom: 16, marginTop: 12 },
  body: { color: stemmColors.text, fontSize: 16, lineHeight: 24 },
  muted: { color: stemmColors.muted, fontSize: 14 },
  section: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, marginBottom: 14, padding: 16 },
  sectionTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  tipBox: { backgroundColor: stemmColors.greenSoft, borderColor: '#A9D8C7', borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 16 },
  primaryButton: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  primaryButtonText: { color: stemmColors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineButton: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  outlineButtonText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  movCard: { alignItems: 'center', backgroundColor: stemmColors.white, borderRadius: 14, borderWidth: 2, flexDirection: 'row', gap: 14, marginBottom: 12, padding: 16 },
  movIcon: { alignItems: 'center', borderRadius: 18, height: 58, justifyContent: 'center', width: 58 },
  movInitial: { fontSize: 17, fontWeight: '900' },
  cardTitle: { color: stemmColors.text, fontSize: 16, fontWeight: '800' },
  badge: { borderRadius: 12, color: stemmColors.white, fontSize: 12, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  centerStage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  vertBarBg: { backgroundColor: '#DDE8EE', borderRadius: 40, height: 220, justifyContent: 'flex-end', overflow: 'hidden', width: 80 },
  vertBarFill: { borderRadius: 40, width: '100%' },
  percent: { fontSize: 42, fontWeight: '900', marginTop: 16 },
  status: { color: stemmColors.text, fontSize: 18, fontWeight: '800', marginBottom: 20 },
  chartPanel: { backgroundColor: '#102031', borderRadius: 14, marginBottom: 14, padding: 14 },
  chartLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 14, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  barBg: { backgroundColor: '#DDE8EE', borderRadius: 4, height: 8, overflow: 'hidden' },
  barFill: { backgroundColor: stemmColors.green, borderRadius: 4, height: 8, width: '82%' },
  scoreWrap: { alignItems: 'center', height: 220, justifyContent: 'center', marginBottom: 24, position: 'relative', width: 220 },
  scoreSvg: { transform: [{ rotate: '-90deg' }] },
  scoreCopy: { alignItems: 'center', position: 'absolute' },
  scoreNumber: { color: stemmColors.green, fontSize: 54, fontWeight: '900' },
  statRow: { backgroundColor: stemmColors.surface, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 14, width: '100%' },
  statValue: { color: stemmColors.green, fontSize: 20, fontWeight: '900' },
  barChart: { alignItems: 'flex-end', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 16, height: 190, marginBottom: 16, padding: 16 },
  chartColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  chartBar: { backgroundColor: stemmColors.green, borderTopLeftRadius: 8, borderTopRightRadius: 8, width: '70%' },
  memberCard: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 14 },
  avatar: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: stemmColors.white, fontWeight: '800' },
  lbFirst: { backgroundColor: stemmColors.greenSoft, borderColor: stemmColors.green, borderWidth: 2 },
  rank: { color: stemmColors.blue, fontSize: 22, fontWeight: '900', width: 32 },
  inputGroup: { marginBottom: 14 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  textarea: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, color: stemmColors.text, fontSize: 16, minHeight: 86, paddingHorizontal: 14, paddingTop: 12 },
});
