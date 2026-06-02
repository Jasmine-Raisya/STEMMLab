import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTeamLocal, saveTeamLocal } from './localDb';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';

export interface Team {
  id: string;
  teamId: string;
  teamName: string;
  members: string[];
  yearLevel: string;
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
          setIsLoadingTeam(false);
          // Sync Firestore if needed
          try {
            const docSnap = await getDoc(doc(db, 'teams', sqliteTeam.id));
            if (docSnap.exists()) {
              // Firestore has latest version, ensure local is up‑to‑date
              const remote = docSnap.data() as Team;
              if (JSON.stringify(remote) !== JSON.stringify(sqliteTeam)) {
                setTeamState(remote);
                saveTeamLocal(remote);
                await AsyncStorage.setItem('team_data', JSON.stringify(remote));
              }
            }
          } catch (e) {
            console.warn('Failed to fetch team from Firestore:', e);
          }
          return;
        }
      } catch (error) {
        console.warn('SQLite fetch failed, falling back to AsyncStorage:', error);
      }

      // Fallback to AsyncStorage
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
        await setDoc(doc(db, 'teams', newTeam.id), newTeam);
      } catch (e) {
        console.error('Failed to save team to local SQLite database or Firestore:', e);
      }
      await AsyncStorage.setItem('team_data', JSON.stringify(newTeam));
    } else {
      await AsyncStorage.removeItem('team_data');
    }
  };

  return (
    <TeamContext.Provider value={{ team, isLoadingTeam, setTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
