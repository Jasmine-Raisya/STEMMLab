import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppLanguage, useLanguage } from '../services/LanguageContext';
import { stemmColors } from './ActivityScaffold';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const options: AppLanguage[] = ['en', 'id'];

  return (
    <View accessibilityLabel={t('common.language')} style={styles.wrap}>
      {options.map((option) => {
        const selected = language === option;
        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => void setLanguage(option)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option === 'en' ? t('common.english') : t('common.indonesian')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: stemmColors.surface,
    borderColor: stemmColors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  option: {
    borderRadius: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selected: { backgroundColor: stemmColors.green },
  label: { color: stemmColors.blue, fontSize: 16, fontWeight: '700' },
  selectedLabel: { color: stemmColors.blue },
});
