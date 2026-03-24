const supabase = require('../config/database');

// ============ USER OPERATIONS ============
const User = {
  create: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  findByRole: async (role) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role);
    if (error) throw error;
    return data;
  }
};

module.exports = User;

module.exports = User;
