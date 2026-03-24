const supabase = require('../config/database');

// ============ ANNOUNCEMENT OPERATIONS ============
const Announcement = {
  create: async (announcementData) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcementData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findByCategory: async (category) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('category', category)
      .order('publish_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  findByCreatedBy: async (userId) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findRecent: async (limit = 10) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('publish_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Announcement;
