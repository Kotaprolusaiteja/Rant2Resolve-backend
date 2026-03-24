const Opportunity = require('../models/Opportunity_Supabase');

// CREATE - Admin only
exports.createOpportunity = async (req, res) => {
  try {
    const { title, company, type, location, mode, stipend, description, skills, eligibility, duration, deadline, applyUrl, isInternal } = req.body;
    const userId = req.user.id;

    if (!title || !company || !type || !location || !mode || !description || !skills || !eligibility || !duration || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const opportunity = await Opportunity.create({
      title,
      company,
      type,
      location,
      mode,
      stipend,
      description,
      skills: Array.isArray(skills) ? skills : [skills],
      eligibility,
      duration,
      deadline: new Date(deadline).toISOString(),
      apply_url: isInternal ? null : applyUrl,
      is_internal: isInternal !== false,
      created_by: userId
    });

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
};

// READ ALL - Public access
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.findAll();
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

// READ ONE - Public access
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
};

// UPDATE - Admin only
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, type, location, mode, stipend, description, skills, eligibility, duration, deadline, applyUrl, isInternal } = req.body;

    const updateData = {
      title,
      company,
      type,
      location,
      mode,
      stipend,
      description,
      skills: Array.isArray(skills) ? skills : [skills],
      eligibility,
      duration,
      deadline: new Date(deadline).toISOString(),
      apply_url: isInternal ? null : applyUrl,
      is_internal: isInternal !== false
    };

    const opportunity = await Opportunity.update(id, updateData);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};

// DELETE - Admin only
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    await Opportunity.delete(id);

    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
};
