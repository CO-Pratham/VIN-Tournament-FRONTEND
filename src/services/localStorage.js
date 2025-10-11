// LocalStorage service for frontend-only data persistence

const STORAGE_KEYS = {
  USER: 'vin_tournament_user',
  TOURNAMENTS: 'vin_tournament_tournaments',
  USER_TOURNAMENTS: 'vin_tournament_user_tournaments',
};

// User Management
export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Tournament Management
export const getTournaments = () => {
  const tournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
  if (tournaments) {
    return JSON.parse(tournaments);
  }
  
  // Initialize with demo data
  const demoTournaments = [
    {
      id: "demo-1",
      title: "BGMI Pro Championship 2025",
      game: "BGMI",
      prize: 100000,
      mode: "Squad",
      entry_fee: 50,
      max_participants: 100,
      status: "upcoming",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      map: "Erangel",
      description: "Join the biggest BGMI tournament of the year! Compete with the best players.",
      rules: "1. No cheating or hacking\n2. Respect all players\n3. Follow tournament schedule",
      participants: [],
      organizer_id: "system",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "Free Fire Masters Cup",
      game: "Free Fire",
      prize: 75000,
      mode: "Squad",
      entry_fee: 30,
      max_participants: 80,
      status: "upcoming",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      map: "Bermuda",
      description: "Show your Free Fire skills and win amazing prizes!",
      rules: "1. No emulator allowed\n2. Original accounts only\n3. Be present 15 minutes early",
      participants: [],
      organizer_id: "system",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-3",
      title: "Valorant Battle Arena",
      game: "Valorant",
      prize: 150000,
      mode: "5v5",
      entry_fee: 100,
      max_participants: 50,
      status: "upcoming",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      map: "Bind",
      description: "Professional Valorant tournament with huge prize pool!",
      rules: "1. Team registration required\n2. Ranked players only\n3. Standard competitive rules apply",
      participants: [],
      organizer_id: "system",
      created_at: new Date().toISOString(),
    }
  ];
  
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(demoTournaments));
  return demoTournaments;
};

export const saveTournaments = (tournaments) => {
  localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
};

export const addTournament = (tournament) => {
  const tournaments = getTournaments();
  const newTournament = {
    ...tournament,
    id: `tournament-${Date.now()}`,
    participants: [],
    created_at: new Date().toISOString(),
  };
  tournaments.push(newTournament);
  saveTournaments(tournaments);
  return newTournament;
};

export const joinTournament = (tournamentId, userId) => {
  const tournaments = getTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) return false;
  if (tournament.participants.includes(userId)) return false;
  if (tournament.participants.length >= tournament.max_participants) return false;
  
  tournament.participants.push(userId);
  saveTournaments(tournaments);
  
  // Also track user's tournaments
  const userTournaments = getUserTournaments();
  if (!userTournaments.includes(tournamentId)) {
    userTournaments.push(tournamentId);
    saveUserTournaments(userTournaments);
  }
  
  return true;
};

export const leaveTournament = (tournamentId, userId) => {
  const tournaments = getTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) return false;
  
  tournament.participants = tournament.participants.filter(id => id !== userId);
  saveTournaments(tournaments);
  
  // Update user's tournaments
  const userTournaments = getUserTournaments();
  saveUserTournaments(userTournaments.filter(id => id !== tournamentId));
  
  return true;
};

// User Tournaments
export const getUserTournaments = () => {
  const userTournaments = localStorage.getItem(STORAGE_KEYS.USER_TOURNAMENTS);
  return userTournaments ? JSON.parse(userTournaments) : [];
};

export const saveUserTournaments = (tournamentIds) => {
  localStorage.setItem(STORAGE_KEYS.USER_TOURNAMENTS, JSON.stringify(tournamentIds));
};

// Clear all data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
