import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { getTeamLocal, saveTeamLocal } from './localDb';
import { createTeamAuthAccount, signInTeamAuthAccount, signOutTeamAuthAccount } from './authService';

export interface Team {
  id: string;
  teamId: string;
  teamName: string;
  members: string[];
  yearLevel: string;
  gradeLevel?: string;
  representativeEmail?: string;
  authUid?: string;
  createdAt?: number;
  ownerUid?: string;
  ownerEmail?: string | null;
}

interface TeamContextType {
  team: Team | null;
  isLoadingTeam: boolean;
  setTeam: (team: Team | null) => Promise<void>;
  registerTeam: (input: {
    representativeEmail: string;
    password: string;
    teamName: string;
    members: string[];
    gradeLevel: string;
  }) => Promise<Team>;
  signInTeam: (input: { representativeEmail: string; password: string }) => Promise<Team>;
  logOutTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

function createTeamCode(teamName: string) {
  const cleanName = teamName.trim() || 'STEMM Lab Team';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName} #${suffix}`;
}

function normalizeTeam(team: Team): Team {
  const gradeLevel = team.gradeLevel ?? team.yearLevel ?? '';
  return {
    ...team,
    gradeLevel,
    yearLevel: team.yearLevel ?? gradeLevel,
    authUid: team.authUid ?? team.ownerUid,
    representativeEmail: team.representativeEmail ?? team.ownerEmail ?? '',
  };
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeamState] = useState<Team | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sqliteTeam = getTeamLocal();
        if (sqliteTeam) {
          setTeamState(sqliteTeam);
          return;
        }
      } catch (error) {
        console.warn('SQLite fetch failed, falling back to AsyncStorage:', error);
      }

      const saved = await AsyncStorage.getItem('team_data');
      if (saved) {
        const parsed = JSON.parse(saved) as Team;
        setTeamState(parsed);
        try {
          saveTeamLocal(parsed);
        } catch (e) {
          console.error('Failed to sync fallback data to SQLite:', e);
        }
      }
    })().finally(() => setIsLoadingTeam(false));
  }, []);

  const setTeam = async (newTeam: Team | null) => {
    const normalizedTeam = newTeam ? normalizeTeam(newTeam) : null;
    setTeamState(normalizedTeam);

    if (normalizedTeam) {
      try {
        saveTeamLocal(normalizedTeam);
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          await setDoc(doc(db, 'teams', normalizedTeam.id), normalizedTeam, { merge: true });
        }
      } catch (e) {
        console.error('Failed to save team to local SQLite database or Firestore:', e);
      }
      await AsyncStorage.setItem('team_data', JSON.stringify(normalizedTeam));
    } else {
      await AsyncStorage.removeItem('team_data');
    }
  };

  const registerTeam = async (input: {
    representativeEmail: string;
    password: string;
    teamName: string;
    members: string[];
    gradeLevel: string;
  }) => {
    const user = await createTeamAuthAccount(input.representativeEmail, input.password, input.teamName);
    const team: Team = normalizeTeam({
      id: user.uid,
      teamId: createTeamCode(input.teamName),
      teamName: input.teamName,
      members: input.members,
      yearLevel: input.gradeLevel,
      gradeLevel: input.gradeLevel,
      representativeEmail: input.representativeEmail,
      authUid: user.uid,
      createdAt: Date.now(),
      ownerUid: user.uid,
      ownerEmail: user.email,
    });

    await setTeam(team);
    return team;
  };

  const signInTeam = async (input: { representativeEmail: string; password: string }) => {
    const user = await signInTeamAuthAccount(input.representativeEmail, input.password);
    let team: Team | null = null;

    try {
      const snapshot = await getDoc(doc(db, 'teams', user.uid));
      if (snapshot.exists()) {
        team = normalizeTeam(snapshot.data() as Team);
      }
    } catch (error) {
      console.warn('Unable to fetch team from Firestore, using local fallback:', error);
    }

    if (!team) {
      const localTeam = getTeamLocal();
      if (localTeam?.id === user.uid || localTeam?.ownerUid === user.uid) {
        team = normalizeTeam(localTeam);
      }
    }

    if (!team) {
      team = normalizeTeam({
        id: user.uid,
        teamId: createTeamCode(user.displayName ?? 'STEMM Lab Team'),
        teamName: user.displayName ?? 'STEMM Lab Team',
        members: [],
        yearLevel: '',
        gradeLevel: '',
        representativeEmail: user.email ?? input.representativeEmail,
        authUid: user.uid,
        createdAt: Date.now(),
        ownerUid: user.uid,
        ownerEmail: user.email,
      });
    }

    await setTeam(team);
    return team;
  };

  const logOutTeam = async () => {
    await signOutTeamAuthAccount();
    setTeamState(null);
    await AsyncStorage.removeItem('team_data');
  };

  return React.createElement(TeamContext.Provider, {
    value: { team, isLoadingTeam, setTeam, registerTeam, signInTeam, logOutTeam },
    children,
  });
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
