import { supabase } from '../lib/supabase';

export const supabaseService = {
  // Tournament operations
  async getAllTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getTournamentById(id) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTournament(tournamentData, bannerFile = null) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Upload banner if provided
    if (bannerFile) {
      const bannerUrl = await this.uploadBanner(bannerFile, data.id);
      const { data: updatedTournament } = await supabase
        .from('tournaments')
        .update({ banner_url: bannerUrl })
        .eq('id', data.id)
        .select()
        .single();
      return updatedTournament;
    }
    
    return data;
  },

  async joinTournament(tournamentId, userId) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([{ tournament_id: tournamentId, user_id: userId }])
      .select();
    
    if (error) throw error;
    return data;
  },

  async leaveTournament(tournamentId, userId) {
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async uploadBanner(file, tournamentId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tournamentId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('tournament-banners')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('tournament-banners')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  // Leaderboard operations
  async getLeaderboard() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        username,
        created_at,
        tournaments_joined:tournament_participants(count)
      `)
      .order('tournaments_joined', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data.map(user => ({
      ...user,
      tournaments_joined: user.tournaments_joined[0]?.count || 0
    }));
  },

  // Public profile operations
  async getPublicProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserTournaments(userId) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select(`
        joined_at,
        tournaments(
          id,
          title,
          game,
          status
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({ ...item.tournaments, joined_at: item.joined_at }));
  },

  async getUserStats(userId) {
    const { data: tournamentsJoined } = await supabase
      .from('tournament_participants')
      .select('id')
      .eq('user_id', userId);
    
    return {
      tournaments_joined: tournamentsJoined?.length || 0,
      tournaments_won: 0, // Placeholder
      total_earnings: 0,   // Placeholder
      rank: null          // Placeholder
    };
  },

  // My tournaments operations
  async getOrganizedTournaments(userId) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('organizer_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getJoinedTournaments(userId) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select(`
        joined_at,
        tournaments(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({ ...item.tournaments, joined_at: item.joined_at }));
  },

  async deleteTournament(tournamentId) {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);
    
    if (error) throw error;
  },

  // Player search operations
  async searchPlayers(searchTerm) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        username,
        player_id,
        favorite_game,
        tournaments_joined:tournament_participants(count)
      `)
      .or(`username.ilike.%${searchTerm}%,player_id.ilike.%${searchTerm}%`)
      .limit(20);
    
    if (error) throw error;
    return data.map(user => ({
      ...user,
      tournaments_joined: user.tournaments_joined[0]?.count || 0
    }));
  },

  // Generate unique player ID
  async generatePlayerId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let playerId;
    let isUnique = false;
    
    while (!isUnique) {
      playerId = 'VT-';
      for (let i = 0; i < 8; i++) {
        playerId += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      const { data } = await supabase
        .from('user_profiles')
        .select('player_id')
        .eq('player_id', playerId)
        .single();
      
      if (!data) isUnique = true;
    }
    
    return playerId;
  }
};