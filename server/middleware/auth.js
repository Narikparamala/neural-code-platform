const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role to validate tokens
);

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = data.user; // user.id etc.
    next();
  } catch (err) {
    console.error('Unexpected auth middleware error:', err);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = auth;
