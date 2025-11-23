import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Ensure these imports match your actual file structure
import { getTimetable, getRooms, getCourses, getTeachers, getBatches } from '@/lib/storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react'; // Optional: for a loading spinner

const TIME_SLOTS_COUNT = 8;
const DAYS_COUNT = 5;

const RoomUtilization = () => {
  const [utilizationData, setUtilizationData] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalTeachers: 0, totalRooms: 0, totalBatches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch all data in parallel using Promise.all
        const [
          fetchedTimetable, 
          fetchedRooms, 
          fetchedCourses, 
          fetchedTeachers, 
          fetchedBatches
        ] = await Promise.all([
          getTimetable(),
          getRooms(),
          getCourses(),
          getTeachers(),
          getBatches()
        ]);

        // 2. Validate that fetchedRooms is an array before mapping
        const roomsArray = Array.isArray(fetchedRooms) ? fetchedRooms : [];
        const timetableArray = Array.isArray(fetchedTimetable) ? fetchedTimetable : [];

        // 3. Perform calculations on the resolved data
        const utilization = roomsArray.map(room => {
          const roomSlots = timetableArray.filter(entry => entry.room_id === room.id);
          const totalSlots = TIME_SLOTS_COUNT * DAYS_COUNT;
          // Create unique key for day-time to avoid double counting duplicates
          const usedSlots = [...new Set(roomSlots.map(s => `${s.day}-${s.time_slot}`))].length;
          const percentage = totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0;

          return {
            room: room.number,
            type: room.type,
            usedSlots,
            totalSlots,
            percentage: percentage.toFixed(1)
          };
        });

        setUtilizationData(utilization);

        setStats({
          totalCourses: Array.isArray(fetchedCourses) ? fetchedCourses.length : 0,
          totalTeachers: Array.isArray(fetchedTeachers) ? fetchedTeachers.length : 0,
          totalRooms: roomsArray.length,
          totalBatches: Array.isArray(fetchedBatches) ? fetchedBatches.length : 0
        });

      } catch (error) {
        console.error("Error fetching utilization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 4. Helper for bar width calculation (Relative to max usage or Absolute 100%)
  // Currently set to Absolute % (e.g., 50% usage fills half the bar). 
  // To make it relative to the busiest room, uncomment the maxPercentage logic below.
  
  // const maxPercentage = Math.max(...utilizationData.map(d => parseFloat(d.percentage)), 1);

  const statCards = [
    { title: 'Total Courses', value: stats.totalCourses, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Teachers', value: stats.totalTeachers, color: 'from-green-500 to-green-600' },
    { title: 'Total Rooms', value: stats.totalRooms, color: 'from-yellow-500 to-yellow-600' },
    { title: 'Total Batches', value: stats.totalBatches, color: 'from-purple-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading utilization data...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-lg text-white bg-gradient-to-br ${stat.color} shadow-lg`}
          >
            <p className="text-sm font-medium opacity-80">{stat.title}</p>
            <p className="text-4xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>
      
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Room Utilization Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilizationData.map((data, index) => (
              <motion.div
                key={data.room}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{data.room}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.type === 'Class' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                    }`}>
                      {data.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {data.usedSlots} / {data.totalSlots} slots ({data.percentage}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    // Changed calculation slightly: The bar now represents the actual percentage (0-100)
                    animate={{ width: `${data.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      parseFloat(data.percentage) > 80 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {utilizationData.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">No utilization data available</p>
              <p className="text-sm text-gray-500 mt-2">Generate a timetable first to see room utilization</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RoomUtilization;