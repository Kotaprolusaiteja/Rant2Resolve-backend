const supabase = require('../config/database');

// ============ NOTIFICATION OPERATIONS ============
const Notification = {
  create: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findByUserId: async (userId, limit = 50, offset = 0) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findUnread: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  findByType: async (userId, type) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  markAsRead: async (id) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  markAllAsRead: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  deleteOldRead: async (daysOld = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('read_at', date.toISOString())
      .eq('is_read', true);
    if (error) throw error;
    return true;
  }
};

module.exports = Notification;
