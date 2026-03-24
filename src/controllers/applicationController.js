const Application = require('../models/Application_Supabase');

// APPLY - Students only
exports.applyForOpportunity = async (req, res) => {
  try {
    const { opportunityId, opportunityTitle, resumePath, statementOfInterest } = req.body;
    const studentId = req.user.id;
    const studentName = req.user.name;
    const studentEmail = req.user.email;

    if (!opportunityId || !opportunityTitle || !statementOfInterest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already applied
    const existingApplication = await Application.checkDuplicate(studentId, opportunityId);
    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this opportunity' });
    }

    const application = await Application.create({
      student_id: studentId,
      student_name: studentName,
      student_email: studentEmail,
      opportunity_id: opportunityId,
      opportunity_title: opportunityTitle,
      resume_path: resumePath,
      statement_of_interest: statementOfInterest
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error applying for opportunity:', error);
    res.status(500).json({ error: 'Failed to apply for opportunity' });
  }
};

// GET Student's Applications
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const applications = await Application.findByStudentId(studentId);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// GET All Applications (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// UPDATE Application Status (Admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.update(id, { status });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

// DELETE Application (Admin only)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await Application.delete(id);

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

// CHECK if student has applied for an opportunity
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const studentId = req.user.id;

    const application = await Application.checkDuplicate(studentId, opportunityId);

    if (application) {
      return res.json({ hasApplied: true, status: application.status });
    }

    res.json({ hasApplied: false });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
};
