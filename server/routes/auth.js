const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be Service Role for admin ops
);

// Register
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('Username 3–30 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, username, expertise } = req.body;

  // sign up
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
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Supabase signIn error:', error);
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  res.json({
    message: 'Login successful',
    user: data.user,
    session: data.session // includes access_token
  });
});

// Get current user (you must pass token from frontend)
router.get('/me', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Missing token' });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Get user error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.json({ user: data.user });
});

module.exports = router;
