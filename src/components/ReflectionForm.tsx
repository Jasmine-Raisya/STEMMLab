import React, { useState } from 'react';
import { Animated, Image, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { stemmColors } from './ActivityScaffold';
import { useActivityReflection } from '../hooks/useActivityReflection';
import { useButtonPress } from '../hooks/useButtonPress';
import { useThemeColors } from '../ThemeContext';
import { ActivityId } from '../types/models';
import { brandColors, radius, typography } from '../tokens';

interface Props {
  activityId: ActivityId;
  teamId: string;
  questions: string[];
  onSaved: () => void;
  attachmentQuestions?: Record<string, string>;
  ratingPlacement?: 'top' | 'bottom';
  ratingStyle?: 'numbers' | 'stars';
  results?: Record<string, unknown>;
}

function ScaleButton({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  pressedScale,
  style,
}: {
  accessibilityLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
  onPress: () => void;
  pressedScale?: number;
  style: StyleProp<ViewStyle>;
}) {
  const press = useButtonPress(pressedScale);
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.handlePressIn}
        onPressOut={press.handlePressOut}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ReflectionForm({
  activityId,
  teamId,
  questions,
  onSaved,
  attachmentQuestions = {},
  ratingPlacement = 'top',
  ratingStyle = 'numbers',
  results,
}: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const reflection = useActivityReflection(activityId, teamId, questions, results);
  const [focusedQuestion, setFocusedQuestion] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving || saved) return;
    setIsSaving(true);
    try {
      await reflection.save();
      setSaved(true);
      setTimeout(onSaved, 220);
    } finally {
      setIsSaving(false);
    }
  };

  const pickImage = async (question: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled) {
      reflection.updateAnswer(question, result.assets[0]?.uri ?? '');
    }
  };

  const renderRating = () => (
    <View style={styles.ratingBlock}>
      <Text style={[styles.label, { color: colors.heading }]}>{t('common.rating')}</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = ratingStyle === 'stars' ? reflection.rating >= value : reflection.rating === value;
          return (
            <ScaleButton
              accessibilityLabel={`${t('common.rating')} ${value}`}
              key={value}
              onPress={() => reflection.setRating(value)}
              pressedScale={0.95}
              style={[
                styles.ratingButton,
                { backgroundColor: selected ? colors.accent : colors.surface, borderColor: selected ? colors.accent : colors.border },
                ratingStyle === 'stars' && styles.starButton,
              ]}
            >
              <Text style={[styles.ratingText, { color: selected ? colors.accentText : colors.text }, ratingStyle === 'stars' && styles.starText]}>
                {ratingStyle === 'stars' ? '★' : value}
              </Text>
            </ScaleButton>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.wrap}>
      {ratingPlacement === 'top' && renderRating()}

      {questions.map((question) => (
        <View key={question} style={styles.field}>
          <Text style={[styles.label, { color: colors.heading }]}>{question}</Text>
          {attachmentQuestions[question] ? (
            <>
              <ScaleButton accessibilityLabel={attachmentQuestions[question]} onPress={() => pickImage(question)} style={styles.attachmentButton}>
                <Text style={styles.attachmentText}>📷 {attachmentQuestions[question]}</Text>
              </ScaleButton>
              {reflection.answers[question]?.length > 0 && (
                <Image source={{ uri: reflection.answers[question] }} style={styles.previewImage} />
              )}
            </>
          ) : (
            <TextInput
              multiline
              onBlur={() => setFocusedQuestion('')}
              onChangeText={(value) => reflection.updateAnswer(question, value)}
              onFocus={() => setFocusedQuestion(question)}
              placeholder={t('common.typeYourAnswer')}
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: focusedQuestion === question ? colors.accent : colors.border,
                  borderWidth: focusedQuestion === question ? 2 : 1,
                  color: colors.text,
                },
              ]}
              textAlignVertical="top"
              value={reflection.answers[question]}
            />
          )}
        </View>
      ))}

      {ratingPlacement === 'bottom' && renderRating()}

      <ScaleButton
        accessibilityLabel={t('common.saveReflection')}
        disabled={!reflection.isValid || isSaving || saved}
        onPress={handleSave}
        style={[styles.saveButton, (!reflection.isValid || isSaving || saved) && styles.disabled]}
      >
        <Text style={styles.saveText}>{saved ? '✓' : t('common.saveReflection')}</Text>
      </ScaleButton>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  label: { ...typography.body, color: stemmColors.blue, fontWeight: '800' },
  ratingBlock: { gap: 8 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingButton: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: radius.radiusMd, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  starButton: { borderRadius: radius.radiusFull },
  ratingText: { color: stemmColors.blue, fontWeight: '900' },
  starText: { fontSize: 22, lineHeight: 26 },
  field: { gap: 6 },
  input: { ...typography.body, borderColor: stemmColors.border, borderRadius: radius.radiusMd, borderWidth: 1, color: stemmColors.text, minHeight: 100, padding: 12 },
  attachmentButton: { alignItems: 'center', backgroundColor: brandColors.coral, borderRadius: radius.radiusMd, minHeight: 56, justifyContent: 'center', paddingHorizontal: 16 },
  attachmentText: { color: brandColors.blush, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  previewImage: { aspectRatio: 4 / 3, borderRadius: radius.radiusMd, marginTop: 8, width: '100%' },
  saveButton: { alignItems: 'center', backgroundColor: brandColors.oliveGold, borderRadius: radius.radiusMd, minHeight: 56, justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  saveText: { color: brandColors.charcoal, fontSize: 17, fontWeight: '900' },
});
