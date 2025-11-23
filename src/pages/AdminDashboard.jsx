import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BookOpen, Users, DoorOpen, GraduationCap, Calendar, BarChart3 } from 'lucide-react';
import CoursesManager from '@/components/admin/CoursesManager';
import TeachersManager from '@/components/admin/TeachersManager';
import RoomsManager from '@/components/admin/RoomsManager';
import BatchesManager from '@/components/admin/BatchesManager';
import TimetableGenerator from '@/components/admin/TimetableGenerator';
import RoomUtilization from '@/components/admin/RoomUtilization';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');

  const handleLogout = () => {
    if (logout()) {
      navigate('/login');
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - UTAS</title>
        <meta name="description" content="Manage courses, teachers, rooms, batches and generate timetables" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">UTAS Admin</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
                <TabsTrigger value="statistics" className="flex items-center justify-center space-x-2"><BarChart3 className="w-4 h-4" /><span>Statistics</span></TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center justify-center space-x-2"><BookOpen className="w-4 h-4" /><span>Courses</span></TabsTrigger>
                <TabsTrigger value="teachers" className="flex items-center justify-center space-x-2"><Users className="w-4 h-4" /><span>Teachers</span></TabsTrigger>
                <TabsTrigger value="rooms" className="flex items-center justify-center space-x-2"><DoorOpen className="w-4 h-4" /><span>Rooms</span></TabsTrigger>
                <TabsTrigger value="batches" className="flex items-center justify-center space-x-2"><GraduationCap className="w-4 h-4" /><span>Batches</span></TabsTrigger>
                <TabsTrigger value="timetable" className="flex items-center justify-center space-x-2"><Calendar className="w-4 h-4" /><span>Timetable</span></TabsTrigger>
              </TabsList>
              
              <TabsContent value="statistics"><RoomUtilization /></TabsContent>
              <TabsContent value="courses"><CoursesManager /></TabsContent>
              <TabsContent value="teachers"><TeachersManager /></TabsContent>
              <TabsContent value="rooms"><RoomsManager /></TabsContent>
              <TabsContent value="batches"><BatchesManager /></TabsContent>
              <TabsContent value="timetable"><TimetableGenerator /></TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;