const supabase = require('../config/database');

// ============ APPLICATION OPERATIONS ============
const Application = {
  create: async (applicationData) => {
    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findByStudentId: async (studentId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findByOpportunityId: async (opportunityId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findByStatus: async (status) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  checkDuplicate: async (studentId, opportunityId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .eq('opportunity_id', opportunityId)
      .single();
    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Application;
