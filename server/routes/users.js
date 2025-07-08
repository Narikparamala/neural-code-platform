const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const router = express.Router();

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar, bio, expertise, reputation, isVerified, preferences')
      .eq('id', userId)
      .single();

    if (error || !data) return res.status(404).json({ message: 'User not found' });

    // if profile is private and requester is not the owner
    if (!data.preferences?.publicProfile && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    res.json({ user: data });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 3, max: 30 }),
  body('bio').optional().isLength({ max: 500 }),
  body('expertise').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, bio, expertise, preferences } = req.body;
  try {
    // Check if username is taken
    if (username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', req.user.id)
        .single();

      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    const updates = { username, bio, expertise, preferences };
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', user: data });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  const { q, expertise, page = 1, limit = 20 } = req.query;
  try {
    let query = supabase
      .from('users')
      .select('id, username, avatar, bio, expertise, reputation, isVerified')
      .eq('preferences->>publicProfile', 'true')
      .order('reputation', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (q) {
      // Supabase full text search (if configured) or ilike fallback
      query = query.ilike('username', `%${q}%`);
    }
    if (expertise) query = query.contains('expertise', [expertise]);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ users: data, currentPage: +page });
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Followers / Following: needs separate table (follows)
// Skipping now for brevity; can add later with supabase.from('follows')

module.exports = router;
