import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { ThemeProvider } from './src/ThemeContext';
import './src/services/i18n';
import { LanguageProvider } from './src/services/LanguageContext';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { TeamSetupScreen } from './src/screens/TeamSetupScreen';
import { DiscriminatorRevealScreen } from './src/screens/DiscriminatorRevealScreen';
import { MainDashboardScreen } from './src/screens/MainDashboardScreen';
import { TeamProfileScreen } from './src/screens/TeamProfileScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { EngineeringMenuScreen } from './src/screens/EngineeringMenuScreen';
import { HealthMenuScreen } from './src/screens/HealthMenuScreen';

// Activities
import { ParachuteActivity } from './src/screens/activities/ParachuteActivity';
import { SoundPollutionActivity } from './src/screens/activities/SoundPollutionActivity';
import { HandFanActivity } from './src/screens/activities/HandFanActivity';
import { EarthquakeActivity } from './src/screens/activities/EarthquakeActivity';
import { HumanPerformanceActivity } from './src/screens/activities/HumanPerformanceActivity';
import { ReactionBoardActivity } from './src/screens/activities/ReactionBoardActivity';
import { BreathingPaceActivity } from './src/screens/activities/BreathingPaceActivity';

const teamData = {
  teamName: 'Phoenix Innovators',
  members: ['Alex Chen', 'Jordan Smith', 'Taylor Brooks', 'Sam Rivera'],
  yearLevel: '7',
  teamId: 'Phoenix Innovators #7843',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1);
  const isDark = useColorScheme() === 'dark';

  const navigate = (screen: number) => setCurrentScreen(screen);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

        {currentScreen === 1  && <SplashScreen onNext={() => navigate(2)} />}
        {currentScreen === 2  && <TeamSetupScreen onNext={() => navigate(3)} />}
        {currentScreen === 3  && <DiscriminatorRevealScreen teamData={teamData} onNext={() => navigate(4)} />}
        {currentScreen === 4  && <MainDashboardScreen onNavigate={navigate} />}
        {currentScreen === 5  && <TeamProfileScreen teamData={teamData} onBack={() => navigate(4)} />}
        {currentScreen === 6  && <SettingsScreen onBack={() => navigate(4)} />}
        {currentScreen === 7  && <EngineeringMenuScreen onBack={() => navigate(4)} onSelectActivity={navigate} />}
        {currentScreen === 8  && <ParachuteActivity onBack={() => navigate(7)} />}
        {currentScreen === 9  && <SoundPollutionActivity onBack={() => navigate(7)} />}
        {currentScreen === 10 && <HandFanActivity onBack={() => navigate(7)} />}
        {currentScreen === 11 && <EarthquakeActivity onBack={() => navigate(7)} />}
        {currentScreen === 12 && <HealthMenuScreen onBack={() => navigate(4)} onSelectActivity={navigate} />}
        {currentScreen === 13 && <HumanPerformanceActivity onBack={() => navigate(12)} />}
        {currentScreen === 14 && <ReactionBoardActivity onBack={() => navigate(12)} />}
        {currentScreen === 15 && <BreathingPaceActivity onBack={() => navigate(12)} />}
        </SafeAreaView>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
});
