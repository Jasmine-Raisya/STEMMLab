import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { initializeDatabase, saveTeamProfile, getTeamProfile } from './localDb';
import { createTeamAuthAccount, signInTeamAuthAccount, signOutTeamAuthAccount } from './authService';
import { fetchTeamProfile, syncTeamProfile } from './firestoreService';
import { TeamProfile } from '../types/models';

const TEAM_ID_KEY = 'stemm.activeTeamId';
const TEAM_PROFILE_BACKUP_KEY = 'stemm.activeTeamProfile';

interface TeamContextValue {
  team: TeamProfile | null;
  isLoadingTeam: boolean;
  registerTeam: (input: Omit<TeamProfile, 'id' | 'authUid' | 'createdAt'> & { password: string }) => Promise<TeamProfile>;
  signInTeam: (input: { representativeEmail: string; password: string }) => Promise<TeamProfile>;
  logOutTeam: () => Promise<void>;
  setTeam: (team: TeamProfile | null) => void;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

function createTeamId(teamName: string) {
  const prefix = teamName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';
  return `${prefix}-${Date.now()}`;
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSavedTeam() {
      try {
        const id = await AsyncStorage.getItem(TEAM_ID_KEY);
        if (!id) return;
        let saved: TeamProfile | null = null;
        try {
          await initializeDatabase();
          saved = await getTeamProfile(id);
        } catch (error) {
          console.warn('Unable to load team from SQLite, using AsyncStorage backup.', error);
        }
        if (!saved) {
          const backup = await AsyncStorage.getItem(TEAM_PROFILE_BACKUP_KEY);
          saved = backup ? (JSON.parse(backup) as TeamProfile) : null;
        }
        if (mounted && saved) setTeam(saved);
      } catch (error) {
        console.warn('Unable to restore saved team profile.', error);
      } finally {
        if (mounted) setIsLoadingTeam(false);
      }
    }

    void loadSavedTeam();

    return () => {
      mounted = false;
    };
  }, []);

  const registerTeam = async (input: Omit<TeamProfile, 'id' | 'authUid' | 'createdAt'> & { password: string }) => {
    const authUser = await createTeamAuthAccount(input.representativeEmail, input.password, input.teamName);
    const profile: TeamProfile = {
      representativeEmail: input.representativeEmail,
      teamName: input.teamName,
      members: input.members,
      gradeLevel: input.gradeLevel,
      id: authUser.uid || createTeamId(input.teamName),
      authUid: authUser.uid,
      createdAt: Date.now(),
    };
    setTeam(profile);

    try {
      await Promise.all([
        AsyncStorage.setItem(TEAM_ID_KEY, profile.id),
        AsyncStorage.setItem(TEAM_PROFILE_BACKUP_KEY, JSON.stringify(profile)),
      ]);
      await initializeDatabase();
      await saveTeamProfile(profile);
      await syncTeamProfile(profile);
    } catch (error) {
      console.warn('Team registered, but local or Firestore persistence failed.', error);
    }

    return profile;
  };

  const signInTeam = async (input: { representativeEmail: string; password: string }) => {
    const authUser = await signInTeamAuthAccount(input.representativeEmail, input.password);
    let profile: TeamProfile | null = null;

    try {
      profile = await fetchTeamProfile(authUser.uid);
    } catch (error) {
      console.warn('Unable to fetch team profile from Firestore; checking local cache.', error);
    }

    if (!profile) {
      try {
        await initializeDatabase();
        profile = await getTeamProfile(authUser.uid);
      } catch (error) {
        console.warn('Unable to fetch team profile from SQLite.', error);
      }
    }

    if (!profile) {
      profile = {
        id: authUser.uid,
        authUid: authUser.uid,
        representativeEmail: input.representativeEmail,
        teamName: authUser.displayName ?? 'STEMM Lab Team',
        members: [],
        gradeLevel: '',
        createdAt: Date.now(),
      };
    }

    setTeam(profile);
    await Promise.all([
      AsyncStorage.setItem(TEAM_ID_KEY, profile.id),
      AsyncStorage.setItem(TEAM_PROFILE_BACKUP_KEY, JSON.stringify(profile)),
    ]);
    return profile;
  };

  const logOutTeam = async () => {
    await signOutTeamAuthAccount();
    await Promise.all([
      AsyncStorage.removeItem(TEAM_ID_KEY),
      AsyncStorage.removeItem(TEAM_PROFILE_BACKUP_KEY),
    ]);
    setTeam(null);
  };

  const value = useMemo(() => ({ team, isLoadingTeam, registerTeam, signInTeam, logOutTeam, setTeam }), [isLoadingTeam, team]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used inside TeamProvider');
  return context;
}
