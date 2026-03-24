const Announcement = require('../models/Announcement_Supabase');

// CREATE - Admin only
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, publishDate } = req.body;
    const userId = req.user.id;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['URGENT', 'INFO', 'EVENT'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category,
      publish_date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
      created_by: userId
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// READ ALL - Public access
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll();
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// READ ONE - Public access
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};

// UPDATE - Admin only
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, publishDate } = req.body;

    if (category && !['URGENT', 'INFO', 'EVENT'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updateData = {
      title,
      content,
      category,
      publish_date: publishDate ? new Date(publishDate).toISOString() : undefined
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const announcement = await Announcement.update(id, updateData);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// DELETE - Admin only
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await Announcement.delete(id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
