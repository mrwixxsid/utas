import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback for consistency
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, Download } from 'lucide-react';
import { getTimetable, getCourses, getRooms, getBatches, getTeachers } from '@/lib/storage'; 
import TimetableGrid from '@/components/TimetableGrid';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const StudentDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [schedule, setSchedule] = useState([]);

  // 1. Initial Data Fetch (Batches & User's default selection)
  useEffect(() => {
    // Must be an async IIFE or a defined async function
    const fetchBatches = async () => {
      // AWAIT the asynchronous function
      const allBatches = await getBatches();
      setBatches(allBatches);
      
      // Auto-select the student's batch if available
      if (user?.batch_id) {
        const userBatch = allBatches.find(b => b.id === user.batch_id);
        if (userBatch) {
          setSelectedBatch(userBatch.id);
          setSelectedSemester(userBatch.semester);
        }
      }
    };

    fetchBatches();
  }, [user]); 
  // 2. Schedule Fetch
  useEffect(() => {
    const fetchSchedule = async () => {
        if (!selectedBatch) return; // Exit if no batch is selected

        const [timetable, courses, rooms, teachers] = await Promise.all([
            getTimetable(),
            getCourses(),
            getRooms(),
            getTeachers(),
        ]);
  
        const batchSchedule = timetable
          .filter(entry => entry.batch_id === selectedBatch)
          .map(entry => {
            const course = courses.find(c => c.id === entry.course_id);
            const room = rooms.find(r => r.id === entry.room_id);
            const teacher = teachers.find(t => t.id === entry.teacher_id);
            return {
              ...entry,
              course_code: course?.code || '',
              course_title: course?.title || '',
              course_name: course?.name || course?.title,
              room_number: room?.number || '',
              teacher_name: teacher?.name || ''
            };
          });
  
        setSchedule(batchSchedule);
    };

    fetchSchedule();
  }, [selectedBatch]); // Re-run when the selectedBatch changes

  const handleExport = () => {
    window.print();
  };

  const handleLogout = () => {
    if (logout()) {
      navigate('/login');
    }
  };

  const selectedBatchData = batches.find(b => b.id === selectedBatch);

  return (
    <>
      <Helmet>
        <title>Student Dashboard - UTAS</title>
        <meta name="description" content="View your class schedule and timetable" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Student Dashboard</h1>
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
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 no-print">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Select Batch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batch</label>
                  <select
                    id="batch-select"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_id} - Year {batch.year}, Sem {batch.semester}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedBatch && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-6">
                 <div className="flex justify-between items-center mb-4 no-print">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Timetable - {selectedBatchData?.batch_id} (Year {selectedBatchData?.year}, Sem {selectedBatchData?.semester})
                  </h2>
                  <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Print</span>
                  </Button>
                </div>
                <TimetableGrid schedule={schedule} viewType="student" />
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;