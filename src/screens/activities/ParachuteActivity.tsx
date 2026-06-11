import React, { useEffect, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';

import { ActivityHeader, BulletList, stemmColors } from '../../components/ActivityScaffold';
import { SpeechButton } from '../../components/SpeechButton';
import { ReflectionForm } from '../../components/ReflectionForm';
import { useTeam } from '../../services/teamContext';
import { useThemeColors } from '../../ThemeContext';

interface Props { onBack: () => void; }

interface Iteration {
  attempt: number;
  name: string;
  time: number;
  height: number;
  velocity: number;
  acceleration: number;
  gForce: number;
}

interface MeasurementInput {
  iterationName: string;
  dropHeight: string;
  measuredTime: string;
}

const instructionImage = require('../../../assets/exp1.jpg');
const requiredIterations = ['Toy without parachute', 'Toy with parachute', 'Toy with modified parachute'];

function translatedArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function parsePositive(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function predictGForceEffect(gForce: number) {
  if (gForce <= 0) {
    return {
      range: '-',
      examples: 'Enter the drop data to calculate G-force.',
      effect: 'Prediction appears after the experiment result is input.',
      bounce: 'Unknown',
    };
  }
  if (gForce <= 5) {
    return {
      range: '1-5 G',
      examples: 'Standing up quickly, elevators, amusement rides',
      effect: 'No injury',
      bounce: 'No bounce expected',
    };
  }
  if (gForce <= 10) {
    return {
      range: '5-10 G',
      examples: 'Hard falls while running, minor car braking',
      effect: 'Possible bruising or strains',
      bounce: 'Small bounce possible',
    };
  }
  if (gForce <= 30) {
    return {
      range: '10-30 G',
      examples: 'Sports collisions, bicycle crashes, car crashes with seatbelts',
      effect: 'Serious injuries possible, such as broken bones or concussion',
      bounce: 'Bounce likely from a hard impact',
    };
  }
  if (gForce <= 50) {
    return {
      range: '30-50 G',
      examples: 'Severe car crashes, falls onto hard surfaces',
      effect: 'High risk of severe injury',
      bounce: 'Strong bounce or rebound likely',
    };
  }
  return {
    range: '50+ G',
    examples: 'Very sudden stops with no cushioning',
    effect: 'Life-threatening injuries likely',
    bounce: 'Violent bounce/rebound likely',
  };
}

function buildIteration(measurement: MeasurementInput, attempt: number): Iteration | null {
  const height = parsePositive(measurement.dropHeight);
  const time = parsePositive(measurement.measuredTime);
  if (!height || !time) return null;

  const velocity = height / time;
  const acceleration = velocity / time;

  return {
    attempt,
    name: measurement.iterationName.trim() || `Iteration ${attempt}`,
    height: Number(height.toFixed(2)),
    time: Number(time.toFixed(2)),
    velocity: Number(velocity.toFixed(2)),
    acceleration: Number(acceleration.toFixed(2)),
    gForce: Number((acceleration / 9.8).toFixed(2)),
  };
}

function OverviewScreen({ onNext, iterations }: { onNext: () => void; iterations: Iteration[] }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const equipment = translatedArray(t('parachute.equipment', { returnObjects: true }));
  const instructions = translatedArray(t('parachute.instructions', { returnObjects: true }));
  const ttsText = [
    t('parachute.objective'),
    ...instructions,
    t('parachute.discussion'),
  ];

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.overview')}</Text>
      <SpeechButton text={ttsText} style={styles.speech} />
      <Image source={instructionImage} resizeMode="contain" style={[styles.diagramImage, { backgroundColor: colors.elevated, borderColor: colors.border }]} />

      {iterations.length > 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{t('parachute.attempt', { attempt: iterations.length + 1 })}</Text>
          <Text style={styles.noticeText}>{t('parachute.previousAttempts', { count: iterations.length })}</Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('parachute.objectiveTitle')}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{t('parachute.objective')}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('parachute.equipmentTitle')}</Text>
        <BulletList items={equipment} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('parachute.instructionsTitle')}</Text>
        <BulletList items={instructions} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Required iterations</Text>
        <Text style={[styles.body, { color: colors.text, marginBottom: 10 }]}>Repeat the drop 3 times so the comparison is fair:</Text>
        <BulletList items={requiredIterations} />
      </View>

      <View style={[styles.scienceBox, { backgroundColor: colors.softGreen, borderColor: colors.accent }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('parachute.discussionTitle')}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{t('parachute.discussion')}</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>
          {iterations.length > 0 ? t('common.continueIteration') : t('common.startExperiment')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TimerScreen({
  measurement,
  onChange,
  onNext,
}: {
  measurement: MeasurementInput;
  onChange: (next: MeasurementInput) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const hasValidMeasurement = Boolean(buildIteration(measurement, 1));

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.timerScrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.timer')}</Text>
      <SpeechButton text={t('parachute.timerInstruction')} style={styles.speech} />
      <View style={styles.timerForm}>
        <Text style={[styles.body, { color: colors.text }]}>{t('parachute.timerInstruction')}</Text>
        <Text style={[styles.body, styles.measurementHint, { color: colors.text }]}>{t('parachute.measurementHint')}</Text>
        <Text style={[styles.body, styles.measurementHint, { color: colors.text }]}>
          Step 1: measure the drop height. Step 2: drop the toy without throwing it and record the time until it first hits the ground.
        </Text>
        <View style={[styles.inputGroup, { width: '100%', marginTop: 18 }]}>
          <Text style={[styles.label, { color: colors.heading }]}>Iteration name</Text>
          <TextInput
            onChangeText={(iterationName) => onChange({ ...measurement, iterationName })}
            placeholder={`Iteration ${measurement.iterationName || ''}`.trim()}
            placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            value={measurement.iterationName}
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={[styles.inputGroup, styles.flex]}>
            <Text style={[styles.label, { color: colors.heading }]}>{t('parachute.dropHeight')}</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(dropHeight) => onChange({ ...measurement, dropHeight })}
              placeholder="1.5"
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={measurement.dropHeight}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex]}>
            <Text style={[styles.label, { color: colors.heading }]}>{t('parachute.measuredTime')}</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(measuredTime) => onChange({ ...measurement, measuredTime })}
              placeholder="2.8"
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={measurement.measuredTime}
            />
          </View>
        </View>
        {!hasValidMeasurement && <Text style={styles.errorText}>{t('parachute.enterMeasurement')}</Text>}
      </View>
      <TouchableOpacity disabled={!hasValidMeasurement} style={[styles.outlineButton, { borderColor: colors.border }, !hasValidMeasurement && styles.disabled]} onPress={onNext}>
        <Text style={[styles.outlineButtonText, { color: colors.text }]}>{t('common.nextStep')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function VideoAnalysisScreen({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const darkButtonBorder = colors.background === '#343133' ? { borderColor: colors.muted, borderWidth: 2 } : null;
  const scrubStartX = useRef(0);
  const [videoUri, setVideoUri] = useState('');
  const [durationMillis, setDurationMillis] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);
  const [impactMillis, setImpactMillis] = useState<number | null>(null);
  const [trackWidth, setTrackWidth] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const progress = durationMillis > 0 ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100)) : 0;
  const impactProgress = impactMillis !== null && durationMillis > 0 ? Math.min(100, Math.max(0, (impactMillis / durationMillis) * 100)) : null;
  const player = useVideoPlayer(null, (videoPlayer) => {
    videoPlayer.timeUpdateEventInterval = 0.1;
  });

  useEffect(() => {
    (player as unknown as { playbackRate?: number }).playbackRate = playbackRate;
  }, [playbackRate, player]);

  useEffect(() => {
    const timeUpdate = player.addListener('timeUpdate', ({ currentTime }) => {
      setPositionMillis(Math.round(currentTime * 1000));
    });
    const sourceLoad = player.addListener('sourceLoad', ({ duration }) => {
      setDurationMillis(Math.round(duration * 1000));
    });
    return () => {
      timeUpdate.remove();
      sourceLoad.remove();
    };
  }, [player]);

  useEffect(() => {
    if (!videoUri) {
      void player.replaceAsync(null);
      return;
    }
    void player.replaceAsync({ uri: videoUri });
  }, [player, videoUri]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.max(0, Math.floor(millis / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['videos'],
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0]?.uri ?? '');
      setDurationMillis(result.assets[0]?.duration ?? 0);
      setPositionMillis(0);
      setImpactMillis(null);
    }
  };

  const seekToX = async (x: number) => {
    if (!videoUri || durationMillis <= 0) return;
    const ratio = Math.min(1, Math.max(0, x / trackWidth));
    const nextPosition = Math.round(durationMillis * ratio);
    setPositionMillis(nextPosition);
    player.currentTime = nextPosition / 1000;
  };

  const scrubber = PanResponder.create({
    onMoveShouldSetPanResponder: () => Boolean(videoUri),
    onStartShouldSetPanResponder: () => Boolean(videoUri),
    onPanResponderGrant: (event) => {
      scrubStartX.current = event.nativeEvent.locationX;
      void seekToX(event.nativeEvent.locationX);
    },
    onPanResponderMove: (_, gesture) => {
      void seekToX(scrubStartX.current + gesture.dx);
    },
  });

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(Math.max(1, event.nativeEvent.layout.width));
  };

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.video')}</Text>
      <SpeechButton text={t('parachute.videoInstruction')} style={styles.speech} />
      <View>
        {videoUri ? (
          <VideoView
            contentFit="contain"
            nativeControls
            player={player as never}
            style={styles.videoPlayer}
          />
        ) : (
          <View style={[styles.videoUploadCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.uploadIcon, { color: colors.heading }]}>+</Text>
            <Text style={[styles.uploadTitle, { color: colors.heading }]}>{t('parachute.uploadVideo')}</Text>
            <Text style={[styles.uploadSub, { color: colors.muted }]}>{t('parachute.uploadVideoSub')}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={pickVideo} style={[styles.primaryButton, darkButtonBorder, { marginTop: 14, width: '100%' }]}>
              <Text style={styles.primaryButtonText}>{t('parachute.chooseVideo')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={[styles.body, { color: colors.text, marginBottom: 14 }]}>{t('parachute.videoInstruction')}</Text>
        <View style={styles.speedRow}>
          {[0.25, 0.5, 1].map((rate) => (
            <TouchableOpacity key={rate} style={[styles.speedButton, playbackRate === rate && styles.speedButtonActive]} onPress={() => setPlaybackRate(rate)}>
              <Text style={[styles.speedText, { color: playbackRate === rate ? '#fff' : colors.text }, playbackRate === rate && styles.speedTextActive]}>{rate}x</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.timelineLabels}>
          <Text style={[styles.muted, { color: colors.muted }]}>{formatTime(positionMillis)}</Text>
          <Text style={[styles.muted, { color: colors.muted }]}>{impactMillis === null ? t('parachute.noImpactMarked') : t('parachute.impactAt', { time: formatTime(impactMillis) })}</Text>
          <Text style={[styles.muted, { color: colors.muted }]}>{formatTime(durationMillis)}</Text>
        </View>
        <View style={[styles.trackBg, !videoUri && styles.disabledTrack]} onLayout={handleTrackLayout} {...scrubber.panHandlers}>
          <View style={[styles.trackFill, { width: `${progress}%` }]} />
          {impactProgress !== null && <View style={[styles.impactMarker, { left: `${impactProgress}%` }]} />}
          {videoUri && <View style={[styles.scrubHandle, { left: `${progress}%` }]} />}
        </View>
        {videoUri && (
          <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border, marginTop: 16 }]} onPress={pickVideo}>
            <Text style={[styles.outlineButtonText, { color: colors.text }]}>{t('parachute.replaceVideo')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity disabled={!videoUri} style={[styles.primaryButton, darkButtonBorder, { marginTop: 8 }, !videoUri && styles.disabled]} onPress={() => setImpactMillis(positionMillis)}>
          <Text style={styles.primaryButtonText}>{t('parachute.markImpact')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border }]} onPress={onNext}>
        <Text style={[styles.outlineButtonText, { color: colors.text }]}>{t('common.nextStep')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PhysicsCalculatorScreen({ iteration, onNext }: { iteration: Iteration | null; onNext: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const prediction = predictGForceEffect(iteration?.gForce ?? 0);
  const results = [
    { label: t('data.time'), value: iteration ? `${iteration.time}s` : '-' },
    { label: t('parachute.dropHeight'), value: iteration ? `${iteration.height}m` : '-' },
    { label: t('data.velocity'), value: iteration ? `${iteration.velocity} m/s` : '-' },
    { label: t('data.acceleration'), value: iteration ? `${iteration.acceleration} m/s2` : '-' },
    { label: t('data.gForce'), value: iteration ? `${iteration.gForce} G` : '-' },
  ];

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.results')}</Text>
      {results.map((result) => (
        <View key={result.label} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.resultLabel, { color: colors.text }]}>{result.label}</Text>
          <Text style={styles.resultValue}>{result.value}</Text>
        </View>
      ))}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>{t('parachute.formulaUsed')}</Text>
        <Text style={[styles.formula, { color: colors.text }]}>{'v = d / t\na = v / t\nG = a / 9.8'}</Text>
      </View>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Prediction from G-force</Text>
        <Text style={[styles.body, { color: colors.text }]}>Object response: {prediction.bounce}</Text>
        <Text style={[styles.body, { color: colors.text }]}>G-force range: {prediction.range}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Comparable examples: {prediction.examples}</Text>
        <Text style={[styles.body, { color: colors.text }]}>Likely effect: {prediction.effect}</Text>
        <Text style={[styles.muted, { color: colors.muted }]}>Important: duration matters. A brief spike can be survivable, while sustained G-forces are more dangerous.</Text>
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
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.iterationLog')}</Text>
      {iterations.length === 0 ? (
        <View style={[styles.section, styles.center, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.body, { color: colors.text }]}>{t('parachute.noIterations')}</Text>
        </View>
      ) : (
        iterations.map((iteration) => (
          <View key={iteration.attempt} style={[styles.iterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(() => {
              const prediction = predictGForceEffect(iteration.gForce);
              return (
                <>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>{iteration.name}</Text>
            <Text style={[styles.body, { color: colors.text }]}>
              {t('parachute.dropHeight')}: {iteration.height}m | {t('data.time')}: {iteration.time}s | {t('data.velocity')}: {iteration.velocity} m/s | {t('data.acceleration')}: {iteration.acceleration} m/s2 | {t('data.gForce')}: {iteration.gForce}G
            </Text>
                  <Text style={[styles.body, { color: colors.text }]}>Object response: {prediction.bounce}</Text>
                  <Text style={[styles.body, { color: colors.text }]}>Likely effect: {prediction.effect}</Text>
                </>
              );
            })()}
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

function LeaderboardScreen({ iterations, onNext }: { iterations: Iteration[]; onNext: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const colors = useThemeColors();
  const teams = team ? [team.teamName] : [];
  const averageTime = iterations.length
    ? (iterations.reduce((sum, iteration) => sum + iteration.time, 0) / iterations.length).toFixed(1)
    : '-';

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.leaderboard')}</Text>
      <Text style={[styles.body, { color: colors.text, marginBottom: 14 }]}>{t('parachute.rankedBy')}</Text>
      {teams.length === 0 && <Text style={[styles.body, { color: colors.text }]}>No synced leaderboard entries yet.</Text>}
      {teams.map((teamName, index) => (
        <View key={teamName} style={[styles.lbRow, index === 0 && styles.lbFirst]}>
          <Text style={styles.rank}>{index + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.teamName}>{teamName}</Text>
            <Text style={styles.muted}>{averageTime}s {t('data.average')} | {iterations.length} {t('data.attempts')}</Text>
          </View>
          {index === 0 && <Text style={styles.teamBadge}>{t('parachute.yourTeam')}</Text>}
        </View>
      ))}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Iteration comparison</Text>
        {iterations.map((iteration) => (
          <Text key={iteration.attempt} style={[styles.body, { color: colors.text }]}>{iteration.name}: {iteration.time}s, {iteration.velocity} m/s, {iteration.gForce} G, {predictGForceEffect(iteration.gForce).bounce}</Text>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onNext}>
        <Text style={styles.primaryButtonText}>{t('common.writeSummary')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function WriteUpScreen({ iterations, onBack }: { iterations: Iteration[]; onBack: () => void }) {
  const { t } = useTranslation();
  const { team } = useTeam();
  const colors = useThemeColors();
  const fields = translatedArray(t('parachute.writeUpFields', { returnObjects: true }));
  const sketchQuestion = t('parachute.submitSketch');
  const averageTime = iterations.length ? Number((iterations.reduce((sum, iteration) => sum + iteration.time, 0) / iterations.length).toFixed(2)) : null;
  const best = [...iterations].sort((a, b) => a.time - b.time)[0] ?? null;

  return (
    <ScrollView style={[styles.pad, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.heading, { color: colors.heading }]}>{t('parachute.writeUp')}</Text>
      <Text style={[styles.body, { color: colors.text, marginBottom: 14 }]}>{t('parachute.reflect')}</Text>
      <SpeechButton text={fields} style={styles.speech} />
      <ReflectionForm
        activityId="parachute"
        attachmentQuestions={{ [sketchQuestion]: t('parachute.insertSketch') }}
        questions={fields}
        ratingPlacement="bottom"
        ratingStyle="stars"
        results={{ iterations, averageTime, best }}
        teamId={team?.id ?? 'local'}
        onSaved={onBack}
      />
    </ScrollView>
  );
}

export function ParachuteActivity({ onBack }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [step, setStep] = useState(1);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [currentIter, setCurrentIter] = useState(1);
  const [measurement, setMeasurement] = useState<MeasurementInput>({ iterationName: '', dropHeight: '', measuredTime: '' });
  const total = 7;
  const currentResult = buildIteration(measurement, currentIter);
  const visibleIterations = currentResult && !iterations.some((iteration) => iteration.attempt === currentResult.attempt)
    ? [...iterations, currentResult]
    : iterations;

  const handleCreateIteration = () => {
    if (!currentResult) return;
    setIterations((previous) => [...previous, currentResult]);
    setCurrentIter((previous) => previous + 1);
    setMeasurement({ iterationName: '', dropHeight: measurement.dropHeight, measuredTime: '' });
    setStep(1);
  };

  const handleFinishIterations = () => {
    if (currentResult && !iterations.some((iteration) => iteration.attempt === currentResult.attempt)) {
      setIterations((previous) => [...previous, currentResult]);
    }
    setStep(6);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ActivityHeader
        title={iterations.length > 0 ? t('parachute.titleWithAttempt', { attempt: currentIter }) : t('parachute.title')}
        step={step}
        total={total}
        color={stemmColors.orange}
        onBack={step === 1 ? onBack : () => setStep(step - 1)}
      />
      <View style={styles.flex}>
        {step === 1 && <OverviewScreen onNext={() => setStep(2)} iterations={iterations} />}
        {step === 2 && <VideoAnalysisScreen onNext={() => setStep(3)} />}
        {step === 3 && <TimerScreen measurement={measurement} onChange={setMeasurement} onNext={() => setStep(4)} />}
        {step === 4 && <PhysicsCalculatorScreen iteration={currentResult} onNext={() => setStep(5)} />}
        {step === 5 && <IterationLogScreen iterations={visibleIterations} onCreateNew={handleCreateIteration} onFinish={handleFinishIterations} />}
        {step === 6 && <LeaderboardScreen iterations={visibleIterations} onNext={() => setStep(7)} />}
        {step === 7 && <WriteUpScreen iterations={visibleIterations} onBack={onBack} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: stemmColors.white, flex: 1 },
  flex: { flex: 1 },
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 32 },
  timerScrollContent: { paddingBottom: 32 },
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
  primaryButton: { alignItems: 'center', backgroundColor: stemmColors.blue, borderColor: '#756A64', borderRadius: 14, borderWidth: 1, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  primaryButtonText: { color: stemmColors.white, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  outlineButton: { alignItems: 'center', borderColor: stemmColors.blue, borderRadius: 14, borderWidth: 2, marginBottom: 8, minHeight: 52, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  outlineButtonText: { color: stemmColors.blue, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  centerStage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  timerForm: { alignItems: 'stretch', marginBottom: 8 },
  center: { alignItems: 'center' },
  timer: { color: stemmColors.blue, fontSize: 72, fontVariant: ['tabular-nums'], fontWeight: '800', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  disabled: { opacity: 0.45 },
  errorText: { color: '#B84A20', fontSize: 14, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  input: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, color: stemmColors.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 },
  measurementHint: { marginTop: 8, textAlign: 'center' },
  diagramImage: { backgroundColor: stemmColors.surface, borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, height: 230, marginBottom: 16, width: '100%' },
  videoPlayer: { aspectRatio: 16 / 9, backgroundColor: '#102031', borderRadius: 14, marginBottom: 14, overflow: 'hidden', width: '100%' },
  videoUploadCard: { alignItems: 'center', aspectRatio: 16 / 9, backgroundColor: '#EAF4F8', borderColor: stemmColors.blue, borderRadius: 14, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', marginBottom: 14, padding: 18 },
  uploadIcon: { color: stemmColors.blue, fontSize: 42, fontWeight: '900', lineHeight: 44 },
  uploadTitle: { color: stemmColors.blue, fontSize: 18, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  uploadSub: { color: stemmColors.muted, fontSize: 14, lineHeight: 20, marginTop: 4, textAlign: 'center' },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  speedRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  speedButton: { borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 10 },
  speedButtonActive: { backgroundColor: stemmColors.orange, borderColor: stemmColors.orange },
  speedText: { color: stemmColors.text, fontSize: 14, fontWeight: '900', textAlign: 'center' },
  speedTextActive: { color: '#fff' },
  trackBg: { backgroundColor: '#DDE8EE', borderRadius: 10, height: 18, justifyContent: 'center', marginBottom: 4, overflow: 'visible' },
  disabledTrack: { opacity: 0.45 },
  trackFill: { backgroundColor: stemmColors.orange, borderRadius: 10, height: 18 },
  impactMarker: { backgroundColor: '#d4183d', borderColor: '#fff', borderRadius: 4, borderWidth: 1, height: 28, marginLeft: -3, position: 'absolute', top: -5, width: 6 },
  scrubHandle: { backgroundColor: stemmColors.blue, borderColor: '#fff', borderRadius: 10, borderWidth: 2, height: 24, marginLeft: -10, position: 'absolute', top: -3, width: 24 },
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
