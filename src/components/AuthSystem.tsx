import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, Shield, Eye, EyeOff, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthSystemProps {
  onLogin: (user: any) => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userID: string;
  bio: string;
}

const AuthSystem: React.FC<AuthSystemProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userID: '',
    bio: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [deviceID, setDeviceID] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    // Generate device ID on component mount
    setDeviceID(generateDeviceID());
    
    // Check for existing session
    checkExistingSession();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOTP && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOTP, otpTimer]);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();
        
        if (profile) {
          onLogin(profile);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const generateDeviceID = (): string => {
    // Generate unique device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown'
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!isLogin) {
      // Registration validation
      if (!formData.username.trim()) newErrors.push('Username is required');
      if (formData.username.length < 3) newErrors.push('Username must be at least 3 characters');
      if (!formData.userID.trim()) newErrors.push('User ID is required');
      if (formData.userID.length < 3) newErrors.push('User ID must be at least 3 characters');
      if (!/^[a-zA-Z0-9_]+$/.test(formData.userID)) newErrors.push('User ID can only contain letters, numbers, and underscores');
      if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');
    }

    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.push('Email is invalid');
    if (!formData.password.trim()) newErrors.push('Password is required');
    if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const checkExistingAccount = async (email: string, userID: string, deviceID: string): Promise<boolean> => {
    try {
      // Check for existing email in auth.users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const emailExists = authUsers.users.some(user => user.email === email);
      
      if (emailExists) {
        setErrors(['An account with this email already exists']);
        return false;
      }

      // Check for existing userID
      const { data: userIDExists } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userID)
        .single();
      
      if (userIDExists) {
        setErrors(['This User ID is already taken']);
        return false;
      }

      // Check for existing device ID
      const { data: deviceExists } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('device_id', deviceID)
        .single();
      
      if (deviceExists) {
        setErrors(['An account already exists on this device']);
        return false;
      }

      return true;
    } catch (error) {
      // If no records found, that's good for registration
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors([]);

    try {
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (error) {
          setErrors([error.message]);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Get user profile and check device ID
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('auth_user_id', data.user.id)
            .single();
          
          if (profileError || !profile) {
            setErrors(['Profile not found']);
            setIsLoading(false);
            return;
          }

          // Check device ID for security
          if (profile.device_id !== deviceID) {
            setErrors(['Device not recognized. Please use the device you registered with.']);
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
          
          onLogin(profile);
        }
      } else {
        // Registration - check constraints first
        if (!(await checkExistingAccount(formData.email, formData.userID, deviceID))) {
          setIsLoading(false);
          return;
        }
        
        // Sign up with Supabase (this will send email confirmation)
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) {
          setErrors([error.message]);
          setIsLoading(false);
          return;
        }

        if (data.user) {
          setPendingEmail(formData.email);
          setShowOTP(true);
          setOtpTimer(120);
        }
      }
    } catch (error: any) {
      setErrors([error.message || 'An error occurred. Please try again.']);
    }
    
    setIsLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setErrors(['Please enter the OTP code']);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otpCode,
        type: 'signup'
      });

      if (error) {
        setErrors([error.message]);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            auth_user_id: data.user.id,
            username: formData.username,
            user_id: formData.userID,
            bio: formData.bio || 'Consciousness explorer and neural researcher',
            device_id: deviceID,
            is_verified: true
          });

        if (profileError) {
          setErrors([profileError.message]);
          setIsLoading(false);
          return;
        }

        // Get the created profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();

        if (profile) {
          onLogin(profile);
        }
      }
    } catch (error: any) {
      setErrors([error.message || 'OTP verification failed']);
    }

    setIsLoading(false);
  };

  const resendOTP = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail
      });

      if (error) {
        setErrors([error.message]);
      } else {
        setOtpTimer(120);
        setOtpCode('');
        setErrors([]);
      }
    } catch (error: any) {
      setErrors([error.message || 'Failed to resend OTP']);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Neural Code
            </h1>
          </motion.div>
          <p className="text-gray-400">
            {isLogin ? 'Welcome back to the consciousness network' : 'Join the consciousness exploration community'}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <AnimatePresence mode="wait">
            {showOTP ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-center">Verify Your Email</h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                  We've sent a verification code to <span className="text-purple-400">{pendingEmail}</span>
                </p>
                
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter code"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span>Time remaining: {formatTime(otpTimer)}</span>
                  </div>
                  
                  {otpTimer === 0 && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={resendOTP}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!otpCode.trim() || otpTimer === 0 || isLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTP(false);
                      setOtpCode('');
                      setOtpTimer(120);
                      setPendingEmail('');
                    }}
                    className="w-full py-2 text-gray-400 hover:text-white text-sm"
                  >
                    Back to Registration
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex mb-6">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 text-center rounded-l-lg transition-colors ${
                      isLogin ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 text-center rounded-r-lg transition-colors ${
                      !isLogin ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your display name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Unique User ID</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                          <input
                            type="text"
                            value={formData.userID}
                            onChange={(e) => setFormData(prev => ({ ...prev, userID: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                            className="w-full pl-8 pr-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="unique_id"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">This will be your unique identifier (letters, numbers, underscore only)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Tell us about your consciousness exploration journey..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {/* Device Security Info */}
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Device Security</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Device ID: <span className="font-mono">{deviceID.slice(0, 8)}...</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      One account per device policy enforced for security
                    </p>
                  </div>

                  {/* Error Messages */}
                  {errors.length > 0 && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Errors</span>
                      </div>
                      {errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-300">• {error}</p>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {isLogin ? 'Login' : 'Create Account'}
                        {!isLogin && <Mail className="w-4 h-4" />}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>Neural Code Platform - Consciousness Exploration Network</p>
          <p className="mt-1">Educational purposes only • Secure & Private</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthSystem;