import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, Download } from 'lucide-react';
import { 
  getTimetable, 
  getCourses, 
  getRooms, 
  getBatches, 
  getTeachers, 
  updateTimetableEntry, 
  addNotification, 
  getNotifications, 
  updateNotification 
} from '@/lib/storage';
import TimetableGrid from '@/components/TimetableGrid';
import { useToast } from '@/components/ui/use-toast';
import SwapRequestDialog from '@/components/SwapRequestDialog';
import NotificationCenter from '@/components/NotificationCenter';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const TeacherDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [swapDetails, setSwapDetails] = useState(null);
  const [isSwapDialogOpen, setSwapDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (user?.teacher_id) {
      const [allTeachers, timetable, courses, rooms, batches, allNotifications] = await Promise.all([
        getTeachers(),
        getTimetable(),
        getCourses(),
        getRooms(),
        getBatches(),
        getNotifications(),
      ]);

      const teacher = allTeachers.find(t => t.id === user.teacher_id);
      if (teacher) setTeacherName(teacher.name);

      const fullSchedule = timetable.map(entry => {
        const course = courses.find(c => c.id === entry.course_id);
        const room = rooms.find(r => r.id === entry.room_id);
        const batch = batches.find(b => b.id === entry.batch_id);
        const entryTeacher = allTeachers.find(t => t.id === entry.teacher_id); // Renamed to avoid confusion
        
        return {
          ...entry,
          course_code: course?.code || '',
          course_title: course?.title || '',
          course_name: course?.name || course?.title || '', 
          room_number: room?.number || '',
          batch_name: batch?.batch_id || '',
          teacher_name: entryTeacher?.name || '',
        };
      }).filter(entry => entry.teacher_id === user.teacher_id); 
      
      setSchedule(fullSchedule);

      const userNotifications = allNotifications.filter(n => 
        n.to_teacher_id === user.teacher_id || n.from_teacher_id === user.teacher_id
      );
      
      const enrichedNotifications = userNotifications.map(n => {
        const fromTeacher = allTeachers.find(t => t.id === n.from_teacher_id);
        const toTeacher = allTeachers.find(t => t.id === n.to_teacher_id);
        const fromCourse = courses.find(c => c.id === n.from_course_id);
        const toCourse = courses.find(c => c.id === n.to_course_id);

        return { 
          ...n, 
          from_teacher_name: fromTeacher?.name, 
          to_teacher_name: toTeacher?.name, 
          from_course_code: fromCourse?.code, 
          to_course_code: toCourse?.code 
        };
      });

      setNotifications(enrichedNotifications.reverse());
      setUnreadCount(userNotifications.filter(n => n.to_teacher_id === user.teacher_id && n.status === 'pending').length);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); 


  const handleDrop = async (draggedEntry, day, timeSlot) => {
    const timetable = await getTimetable(); // Get the latest timetable data
    const targetSlotEntries = timetable.filter(entry => entry.day === day && entry.time_slot === timeSlot);
    
    if (draggedEntry.day === day && draggedEntry.time_slot === timeSlot) return;

    if (targetSlotEntries.some(entry => entry.teacher_id === user.teacher_id)) {
      toast({ title: "Conflict", description: "You already have a class in this slot.", variant: "destructive" });
      return;
    }

    if (targetSlotEntries.some(entry => entry.batch_id === draggedEntry.batch_id)) {
        toast({ title: "Conflict", description: "This batch already has a class in this slot.", variant: "destructive" });
        return;
    }

    if (targetSlotEntries.length === 0) {
      await updateTimetableEntry(draggedEntry.id, { day, time_slot: timeSlot }); // AWAIT update
      toast({ title: "Success", description: "Class moved successfully." });
      fetchData();
      return;
    }

    const targetEntry = targetSlotEntries[0];
    if (targetEntry.teacher_id !== user.teacher_id) {
      setSwapDetails({ from: draggedEntry, to: targetEntry });
      setSwapDialogOpen(true);
    }
  };

  const handleConfirmSwap = async () => {
    const { from, to } = swapDetails;
    await addNotification({ // AWAIT notification creation
      from_teacher_id: from.teacher_id, to_teacher_id: to.teacher_id,
      from_timetable_id: from.id, to_timetable_id: to.id,
      from_day: from.day, from_time_slot: from.time_slot,
      to_day: to.day, to_time_slot: to.time_slot,
      from_course_id: from.course_id, to_course_id: to.course_id,
      status: 'pending',
    });
    toast({ title: "Request Sent", description: "Swap request has been sent." });
    setSwapDialogOpen(false);
    setSwapDetails(null);
    fetchData(); // Refetch data to update notification center
  };

  const handleNotificationAction = async (notificationId, status) => {
    const currentNotifications = await getNotifications(); // Fetch the latest state
    const notification = currentNotifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    await updateNotification(notificationId, { status }); 

    if (status === 'approved') {
      const fromEntryUpdates = { day: notification.to_day, time_slot: notification.to_time_slot };
      const toEntryUpdates = { day: notification.from_day, time_slot: notification.from_time_slot };
      
      // AWAIT both timetable entry updates
      await updateTimetableEntry(notification.from_timetable_id, fromEntryUpdates);
      await updateTimetableEntry(notification.to_timetable_id, toEntryUpdates);
      
      toast({ title: "Swap Approved", description: "The timetable has been updated." });
    } else {
      toast({ title: "Swap Rejected", description: "The swap request has been rejected." });
    }
    fetchData(); // Refetch data to update timetable and notification center
  };

  const handleExport = () => window.print();
  const handleLogout = () => logout() && navigate('/login');

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - UTAS</title>
        <meta name="description" content="View your teaching schedule and assigned courses" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Teacher Dashboard</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{teacherName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationCenter 
                  notifications={notifications} 
                  currentUserId={user?.teacher_id} // Use optional chaining for safety
                  onAction={handleNotificationAction}
                  unreadCount={unreadCount}
                />
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-6"
          >
            <div className="flex justify-between items-center mb-6 no-print">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">My Weekly Schedule</h2>
              <Button onClick={handleExport} variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Print</span>
              </Button>
            </div>
            {/* Pass the correct teacher ID for filtering/highlighting in the grid */}
            <TimetableGrid 
              schedule={schedule} 
              viewType="teacher" 
              onDrop={handleDrop}
              currentUserId={user?.teacher_id}
            />
          </motion.div>
        </main>
      </div>
      <SwapRequestDialog 
        open={isSwapDialogOpen}
        onOpenChange={setSwapDialogOpen}
        swapDetails={swapDetails}
        onConfirm={handleConfirmSwap}
      />
    </>
  );
};

export default TeacherDashboard;