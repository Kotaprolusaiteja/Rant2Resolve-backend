const supabase = require('../config/database');

// ============ ISSUE OPERATIONS ============
const Issue = {
  create: async (issueData) => {
    const { data, error } = await supabase
      .from('issues')
      .insert([issueData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findByStudentId: async (studentId) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findByStatus: async (status) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findByCategory: async (category) => {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  addReply: async (id, reply) => {
    const issue = await Issue.findById(id);
    if (!issue) throw new Error('Issue not found');

    const updatedReplies = [...(issue.replies || []), reply];
    return Issue.update(id, { replies: updatedReplies });
  },

  updateReaction: async (id, reactions) => {
    return Issue.update(id, { reactions });
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Issue;
