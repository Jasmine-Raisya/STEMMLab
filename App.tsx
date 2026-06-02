import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/ThemeContext';
import './src/services/i18n';
import { LanguageProvider } from './src/services/LanguageContext';
import { TeamProvider, useTeam } from './src/services/teamContext';
import { initializeDatabase } from './src/services/localDb';
import { registerBackgroundSync } from './src/services/backgroundSync';
import { requestNotificationPermissions } from './src/services/notificationService';
import { useFirebaseAuth } from './src/services/authService';

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

const ROUTES = {
  splash: 1,
  register: 2,
  teamCode: 3,
  dashboard: 4,
  teamProfile: 5,
  settings: 6,
  engineering: 7,
  parachute: 8,
  sound: 9,
  handFan: 10,
  earthquake: 11,
  health: 12,
  humanPerformance: 13,
  reaction: 14,
  breathing: 15,
} as const;

type RouteId = (typeof ROUTES)[keyof typeof ROUTES];

const protectedRoutes = new Set<RouteId>([
  ROUTES.teamCode,
  ROUTES.dashboard,
  ROUTES.teamProfile,
  ROUTES.settings,
  ROUTES.engineering,
  ROUTES.parachute,
  ROUTES.sound,
  ROUTES.handFan,
  ROUTES.earthquake,
  ROUTES.health,
  ROUTES.humanPerformance,
  ROUTES.reaction,
  ROUTES.breathing,
]);

function isRouteId(screen: number): screen is RouteId {
  return Object.values(ROUTES).includes(screen as RouteId);
}

export default function App() {
  useEffect(() => {
    void initializeDatabase();
    void requestNotificationPermissions();
    void registerBackgroundSync();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SafeAreaProvider>
          <TeamProvider>
            <AppNavigator />
          </TeamProvider>
        </SafeAreaProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<RouteId | null>(null);
  const isDark = useColorScheme() === 'dark';
  const { team, isLoadingTeam } = useTeam();
  useFirebaseAuth();

  useEffect(() => {
    if (isLoadingTeam || currentScreen !== null) return;
    setCurrentScreen(team ? ROUTES.dashboard : ROUTES.splash);
  }, [currentScreen, isLoadingTeam, team]);

  const navigate = (screen: number) => {
    setCurrentScreen(isRouteId(screen) ? screen : ROUTES.dashboard);
  };

  if (isLoadingTeam || currentScreen === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <View style={styles.loading}>
          <ActivityIndicator color="#0074D9" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const activeScreen = !team && protectedRoutes.has(currentScreen) ? ROUTES.register : currentScreen;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

        {activeScreen === ROUTES.splash && <SplashScreen onNext={() => navigate(ROUTES.register)} />}
        {activeScreen === ROUTES.register && <TeamSetupScreen onRegistered={() => navigate(ROUTES.teamCode)} onSignedIn={() => navigate(ROUTES.dashboard)} />}
        {activeScreen === ROUTES.teamCode && <DiscriminatorRevealScreen teamData={{ teamId: team?.id ?? '' }} onNext={() => navigate(ROUTES.dashboard)} />}
        {activeScreen === ROUTES.dashboard && <MainDashboardScreen onNavigate={navigate} />}
        {activeScreen === ROUTES.teamProfile && <TeamProfileScreen onBack={() => navigate(ROUTES.dashboard)} />}
        {activeScreen === ROUTES.settings && <SettingsScreen onBack={() => navigate(ROUTES.dashboard)} onLoggedOut={() => navigate(ROUTES.register)} />}
        {activeScreen === ROUTES.engineering && <EngineeringMenuScreen onBack={() => navigate(ROUTES.dashboard)} onSelectActivity={navigate} />}
        {activeScreen === ROUTES.parachute && <ParachuteActivity onBack={() => navigate(ROUTES.engineering)} />}
        {activeScreen === ROUTES.sound && <SoundPollutionActivity onBack={() => navigate(ROUTES.engineering)} />}
        {activeScreen === ROUTES.handFan && <HandFanActivity onBack={() => navigate(ROUTES.engineering)} />}
        {activeScreen === ROUTES.earthquake && <EarthquakeActivity onBack={() => navigate(ROUTES.engineering)} />}
        {activeScreen === ROUTES.health && <HealthMenuScreen onBack={() => navigate(ROUTES.dashboard)} onSelectActivity={navigate} />}
        {activeScreen === ROUTES.humanPerformance && <HumanPerformanceActivity onBack={() => navigate(ROUTES.health)} />}
        {activeScreen === ROUTES.reaction && <ReactionBoardActivity onBack={() => navigate(ROUTES.health)} />}
        {activeScreen === ROUTES.breathing && <BreathingPaceActivity onBack={() => navigate(ROUTES.health)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
