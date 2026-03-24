
const User = require('../models/User_Supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key_123', {
    expiresIn: '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Basic Validation
    if (!name || !email || !password || !department) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findByEmail(normalizedEmail);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'STUDENT',
      department,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    const token = signToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to server error.' });
  }
};
