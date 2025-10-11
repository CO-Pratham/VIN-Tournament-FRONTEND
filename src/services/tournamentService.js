import { supabase } from '../lib/supabase'

export const tournamentService = {
  async getAllTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createTournament(tournament) {
    console.log('Creating tournament with data:', tournament);
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournament])
      .select()
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data[0]
  },

  async joinTournament(tournamentId, userId, registrationData = {}) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert([{ 
        tournament_id: tournamentId, 
        user_id: userId,
        player_name: registrationData.playerName || null,
        game_id: registrationData.gameId || null,
        whatsapp_no: registrationData.whatsappNo || null
      }])
    
    if (error) throw error
    return data
  },

  async getTournamentById(id) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async leaveTournament(tournamentId, userId) {
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
    
    if (error) throw error
  }
}