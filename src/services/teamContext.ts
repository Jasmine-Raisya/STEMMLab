import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { getTeamLocal, saveTeamLocal } from './localDb';

export interface Team {
  id: string;
  teamId: string;
  teamName: string;
  members: string[];
  yearLevel: string;
  ownerUid?: string;
  ownerEmail?: string | null;
}

interface TeamContextType {
  team: Team | null;
  isLoadingTeam: boolean;
  setTeam: (team: Team | null) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

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
    setTeamState(newTeam);

    if (newTeam) {
      try {
        saveTeamLocal(newTeam);
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
          await setDoc(doc(db, 'teams', newTeam.id), newTeam);
        }
      } catch (e) {
        console.error('Failed to save team to local SQLite database or Firestore:', e);
      }
      await AsyncStorage.setItem('team_data', JSON.stringify(newTeam));
    } else {
      await AsyncStorage.removeItem('team_data');
    }
  };

  return React.createElement(TeamContext.Provider, {
    value: { team, isLoadingTeam, setTeam },
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
