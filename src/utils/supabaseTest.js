import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
    try {
        // Test the connection by trying to read the user_profiles table
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase connection test error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return false;
        }

        console.log('Supabase connection successful:', {
            tableExists: true,
            dataReceived: !!data
        });
        return true;
    } catch (error) {
        console.error('Unexpected error testing Supabase connection:', error);
        return false;
    }
};