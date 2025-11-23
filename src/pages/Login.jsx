import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const role = await login(email, password);
    if (role) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - UTAS</title>
        <meta name="description" content="Login to University Timetable Automation System" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">UTAS</h1>
              <p className="text-gray-600 dark:text-gray-400">University Timetable Automation System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-3 text-lg">
                Sign In
              </Button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p><strong>Admin:</strong> admin@utas.edu / admin123</p>
                <p><strong>Teacher:</strong> teacher1@utas.edu / teacher123</p>
                <p><strong>Student:</strong> student@utas.edu / student123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;