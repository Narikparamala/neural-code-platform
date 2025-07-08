const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ✅ Supabase client — use environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Must be service role for admin operations
);

// ------------------------
// Register
// ------------------------
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, username, expertise } = req.body;

  try {
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, expertise: expertise || [] }
      }
    });

    if (error) {
      console.error('Supabase signUp error:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data.user
    });
  } catch (err) {
    console.error('Unexpected register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ------------------------
// Login
// ------------------------
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase signIn error:', error);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session // includes access_token, refresh_token
    });
  } catch (err) {
    console.error('Unexpected login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ------------------------
// Get current user
// ------------------------
router.get('/me', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Get user error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ user: data.user });
  } catch (err) {
    console.error('Unexpected get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
