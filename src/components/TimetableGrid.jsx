import React from 'react';
import { motion } from 'framer-motion';

const TIME_SLOTS = [
  '8:45-9:35',
  '9:40-10:30',
  '10:35-11:25',
  '11:30-12:20',
  '12:25-1:15',
  'LUNCH',
  '2:00-2:45',
  '2:45-3:30',
  '3:30-4:15'
];

const DAYS = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const TimetableGrid = ({ schedule, viewType, onDrop, currentUserId }) => {
  const handleDragStart = (e, entry) => {
    if (viewType !== 'teacher' || entry.teacher_id !== currentUserId) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(entry));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, day, timeSlot) => {
    e.preventDefault();
    if (viewType !== 'teacher') return;
    const draggedEntry = JSON.parse(e.dataTransfer.getData('application/json'));
    onDrop(draggedEntry, day, timeSlot);
  };

  const getSlotContent = (day, timeSlot) => {
   
    if (!schedule || !Array.isArray(schedule)) return null;

    const entries = schedule.filter( 
      entry => entry.day === day && entry.time_slot === timeSlot
    );

    if (entries.length === 0) return null;

    return entries.map((entry, idx) => (
      <motion.div
        key={entry.id || idx}
        layoutId={entry.id}
        draggable={viewType === 'teacher' && entry.teacher_id === currentUserId}
        onDragStart={(e) => handleDragStart(e, entry)}
        onDragEnd={handleDragEnd}
        className={`p-2 rounded-lg text-xs shadow-sm transition-all duration-300 ${
          viewType === 'teacher' && entry.teacher_id === currentUserId
            ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 cursor-grab hover:shadow-md hover:scale-105'
            : 'bg-gray-100 dark:bg-gray-800 border dark:border-gray-700'
        } ${
          entry.group ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700' : ''
        }`}
      >
        <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
          {entry.course_code}
          {entry.group && <span className="ml-1">({entry.group})</span>}
        </div>
        <div className="text-gray-700 dark:text-gray-300 truncate">{entry.course_name || entry.course_title}</div>
        <div className="text-gray-600 dark:text-gray-400 truncate">
          {viewType === 'teacher' ? entry.batch_name : entry.teacher_name}
        </div>
        <div className="text-gray-500 font-medium">Room: {entry.room_number}</div>
      </motion.div>
    ));
  };

  return (
    <div className="overflow-x-auto printable-area bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-inner">
      <div className="grid grid-cols-6 gap-1 min-w-[1000px]">
        <div className="font-bold text-center p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-lg sticky left-0 z-10">Time</div>
        {DAYS.map(day => (
          <div key={day} className="font-bold text-center p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 first-of-type:rounded-tr-lg">
            {day}
          </div>
        ))}

        {TIME_SLOTS.map((slot) => (
          <React.Fragment key={slot}>
            <div
              className={`p-2 font-medium text-center flex items-center justify-center sticky left-0 z-10 ${
                slot === 'LUNCH'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200'
              } rounded-bl-lg rounded-tl-lg`}
            >
              {slot}
            </div>
            {DAYS.map(day => (
              <motion.div
                key={`${day}-${slot}`}
                onDragOver={slot !== 'LUNCH' ? handleDragOver : undefined}
                onDrop={slot !== 'LUNCH' ? (e) => handleDrop(e, day, slot) : undefined}
                className={`p-1 space-y-1 min-h-[70px] border border-dashed border-gray-200 dark:border-gray-700 rounded-md transition-colors ${
                  slot === 'LUNCH' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {slot !== 'LUNCH' && getSlotContent(day, slot)}
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimetableGrid;