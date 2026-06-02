import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { stemmColors } from './ActivityScaffold';
import { useActivityReflection } from '../hooks/useActivityReflection';
import { ActivityId } from '../types/models';

interface Props {
  activityId: ActivityId;
  teamId: string;
  questions: string[];
  onSaved: () => void;
  attachmentQuestions?: Record<string, string>;
  ratingPlacement?: 'top' | 'bottom';
  ratingStyle?: 'numbers' | 'stars';
}

export function ReflectionForm({
  activityId,
  teamId,
  questions,
  onSaved,
  attachmentQuestions = {},
  ratingPlacement = 'top',
  ratingStyle = 'numbers',
}: Props) {
  const { t } = useTranslation();
  const reflection = useActivityReflection(activityId, teamId, questions);

  const handleSave = async () => {
    await reflection.save();
    onSaved();
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
      <Text style={styles.label}>{t('common.rating')}</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = ratingStyle === 'stars' ? reflection.rating >= value : reflection.rating === value;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={value}
              onPress={() => reflection.setRating(value)}
              style={[styles.ratingButton, ratingStyle === 'stars' && styles.starButton, selected && styles.ratingSelected]}
            >
              <Text style={[styles.ratingText, ratingStyle === 'stars' && styles.starText, selected && styles.ratingTextSelected]}>
                {ratingStyle === 'stars' ? '★' : value}
              </Text>
            </TouchableOpacity>
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
          <Text style={styles.label}>{question}</Text>
          {attachmentQuestions[question] ? (
            <>
              <TouchableOpacity accessibilityRole="button" onPress={() => pickImage(question)} style={styles.attachmentButton}>
                <Text style={styles.attachmentText}>{attachmentQuestions[question]}</Text>
              </TouchableOpacity>
              {reflection.answers[question]?.length > 0 && (
                <Image source={{ uri: reflection.answers[question] }} style={styles.previewImage} />
              )}
            </>
          ) : (
            <TextInput
              multiline
              onChangeText={(value) => reflection.updateAnswer(question, value)}
              placeholder={t('common.typeYourAnswer')}
              style={styles.input}
              textAlignVertical="top"
              value={reflection.answers[question]}
            />
          )}
        </View>
      ))}

      {ratingPlacement === 'bottom' && renderRating()}

      <TouchableOpacity disabled={!reflection.isValid} onPress={handleSave} style={[styles.saveButton, !reflection.isValid && styles.disabled]}>
        <Text style={styles.saveText}>{t('common.saveReflection')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '800' },
  ratingBlock: { gap: 8 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingButton: { alignItems: 'center', borderColor: stemmColors.border, borderRadius: 12, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  starButton: { borderRadius: 22 },
  ratingSelected: { backgroundColor: stemmColors.green, borderColor: stemmColors.green },
  ratingText: { color: stemmColors.blue, fontWeight: '900' },
  starText: { fontSize: 22, lineHeight: 26 },
  ratingTextSelected: { color: '#fff' },
  field: { gap: 6 },
  input: { borderColor: stemmColors.border, borderRadius: 14, borderWidth: 1, color: stemmColors.text, fontSize: 16, minHeight: 92, padding: 12 },
  attachmentButton: { alignItems: 'center', backgroundColor: stemmColors.blue, borderRadius: 14, minHeight: 52, justifyContent: 'center', paddingHorizontal: 16 },
  attachmentText: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  previewImage: { aspectRatio: 4 / 3, borderRadius: 14, marginTop: 8, width: '100%' },
  saveButton: { alignItems: 'center', backgroundColor: stemmColors.green, borderRadius: 14, minHeight: 52, justifyContent: 'center' },
  disabled: { opacity: 0.45 },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '900' },
});
