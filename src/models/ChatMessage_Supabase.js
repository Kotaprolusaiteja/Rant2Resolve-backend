const supabase = require('../config/database');

// ============ CHAT MESSAGE OPERATIONS ============
const ChatMessage = {
  create: async (messageData) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([messageData])
      .select();
    if (error) throw error;
    return data[0];
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findAll: async (limit = 100, offset = 0) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  findBySenderId: async (senderId, limit = 50) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  addLike: async (id, userId) => {
    const message = await ChatMessage.findById(id);
    if (!message) throw new Error('Message not found');

    const likedBy = message.liked_by || [];
    if (!likedBy.includes(userId)) {
      likedBy.push(userId);
    }

    return ChatMessage.update(id, {
      likes: likedBy.length,
      liked_by: likedBy
    });
  },

  removeLike: async (id, userId) => {
    const message = await ChatMessage.findById(id);
    if (!message) throw new Error('Message not found');

    const likedBy = (message.liked_by || []).filter(uid => uid !== userId);
    return ChatMessage.update(id, {
      likes: likedBy.length,
      liked_by: likedBy
    });
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = ChatMessage;

module.exports = ChatMessage;
