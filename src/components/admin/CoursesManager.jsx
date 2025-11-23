import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getCourses, addCourse, updateCourse, deleteCourse, getTeachers } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import CourseDialog from './CourseDialog';

const CoursesManager = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, teachersData] = await Promise.all([
        getCourses(),
        getTeachers()
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      console.error("Error loading data", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingCourse(null);
    setDialogOpen(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      await fetchData(); // Refresh
      toast({ title: "Success", description: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      // FIX: Improved error reporting
      toast({ 
        variant: "destructive", 
        title: "Error Deleting Course", 
        description: error.message || "Failed to delete course." 
      });
    }
  };

  const handleSave = async (courseData) => {
    try {
      // FIX: Removed redundant legacy mapping to simplify data structure.
      // Assumes courseData from the dialog has the correct field names (e.g., 'name', 'type').
      const dataToSave = courseData;

      if (editingCourse) {
        await updateCourse(editingCourse.id, dataToSave);
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        await addCourse(dataToSave);
        toast({ title: "Success", description: "Course added successfully" });
      }
      
      await fetchData(); // Refresh
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save course:", error);
      // FIX: Improved error reporting to show the actual error message
      toast({ 
        variant: "destructive", 
        title: "Error Saving Course", 
        description: error.message || "Failed to save course." 
      });
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.short_name : 'N/A';
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-gray-500"/></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Courses Management</h2>
        <Button onClick={handleAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Credits</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Hrs</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Teacher</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Y/S</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">{course.code}</td>
                <td className="px-4 py-3 text-gray-900">{course.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.type === 'Theory' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {course.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">{course.credits}</td>
                <td className="px-4 py-3 text-gray-900">{course.contact_hours}</td>
                <td className="px-4 py-3 text-gray-900">{getTeacherName(course.assigned_teacher_id)}</td>
                <td className="px-4 py-3 text-gray-900">{course.year}/{course.semester}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(course)} variant="outline" size="sm" className="hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(course.id)} variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse}
        teachers={teachers}
        onSave={handleSave}
      />
    </motion.div>
  );
};

export default CoursesManager;