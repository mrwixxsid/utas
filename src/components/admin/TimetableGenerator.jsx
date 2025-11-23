import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, Loader2 } from 'lucide-react'; 
import { useToast } from '@/components/ui/use-toast';
import { generateTimetable } from '@/lib/timetableGenerator';

import { getTimetable, setTimetable, deleteAllTimetableEntries } from '@/lib/storage'; 
import TimetableGrid from '@/components/TimetableGrid';

const TimetableGenerator = () => {
  const [timetable, setLocalTimetable] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch timetable from Firestore on load
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data = await getTimetable(); 
      setLocalTimetable(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load timetable", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load timetable" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleGenerate = async () => {
    // CRITICAL FIX 1: Add confirmation before deleting and generating
    const confirmed = window.confirm(
      "Are you sure you want to generate a new timetable? This will DELETE all existing timetable data."
    );

    if (!confirmed) {
      toast({ title: "Cancelled", description: "Timetable generation cancelled." });
      return;
    }
    
    setGenerating(true);
    try {
      // CRITICAL FIX 2: Delete existing data first
      await deleteAllTimetableEntries();

      // 1. Generate new timetable logic
      const result = await generateTimetable(); 

      if (result.success) {
        // 2. Save the newly generated timetable to Firestore
        await setTimetable(result.timetable);
        
        // 3. Update local state and show success
        setLocalTimetable(result.timetable);
        toast({ title: "Success", description: `Timetable generated successfully with ${result.timetable.length} slots.` });
      } else {
        // Handle generation failure (e.g., if constraints could not be met)
        toast({ variant: "destructive", title: "Generation Failed", description: result.message || "An unknown error occurred during generation." });
      }

    } catch (error) {
      console.error("Timetable generation failed:", error);
      toast({ variant: "destructive", title: "Error", description: "An internal error occurred during generation." });
    } finally {
      setGenerating(false);
    }
  };

  // Function to refresh the view manually
  const handleRefresh = () => {
    fetchTimetable();
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Timetable Generator</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={loading || generating}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh View</span>
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={generating} 
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            <span>{generating ? 'Generating...' : 'Generate New Routine'}</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Scheduling Rules:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• No Room Conflict: Two classes cannot be in the same room at the same time.</li>
          <li>• No Teacher Conflict: A teacher cannot be scheduled for two classes at the same time.</li>
          <li>• Lab courses with &gt;25 students auto-split into G1 and G2.</li>
          <li>• Capacity Match: Assign rooms based on batch size and room capacity.</li>
          <li>• Balance Teacher Load: Avoid overloading teachers daily; aim for even distribution across the week.</li>
          <li>• Lunch break: 1:15 PM - 2:00 PM (LUNCH slot in grid) (no classes scheduled)</li>
        </ul>
      </div>

      {timetable.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Timetable Preview</h3>
          <p className="text-sm text-gray-600 mb-4">
            Total scheduled slots: {timetable.length}
          </p>
          <TimetableGrid schedule={timetable} /> 
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No timetable generated yet</p>
          <p className="text-sm text-gray-500 mt-2">
              Click **"Generate New Routine"** to create a fresh timetable based on current courses, teachers, and rooms.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TimetableGenerator;