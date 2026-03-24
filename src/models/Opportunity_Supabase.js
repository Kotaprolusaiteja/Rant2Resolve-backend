const supabase = require('../config/database');

// ============ OPPORTUNITY OPERATIONS ============
const Opportunity = {
  create: async (opportunityData) => {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunityData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findByType: async (type) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('type', type)
      .order('deadline', { ascending: true });
    if (error) throw error;
    return data;
  },

  findUpcoming: async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .gt('deadline', new Date().toISOString())
      .order('deadline', { ascending: true });
    if (error) throw error;
    return data;
  },

  findByCreatedBy: async (userId) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Opportunity;
