import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import TeacherDialog from './TeacherDialog';

const TeachersManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const { toast } = useToast();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching teachers", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch teachers" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAdd = () => {
    setEditingTeacher(null);
    setDialogOpen(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTeacher(id);
      await fetchTeachers();
      toast({ title: "Success", description: "Teacher deleted successfully." });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete teacher." });
    }
  };

  // FIX IS HERE: Correctly destructure password and pass arguments to addTeacher.
  const handleSave = async (data) => {
    try {
      if (editingTeacher) {
        // If editing, exclude password as it should only be changed manually
        const { password, ...updates } = data; 
        await updateTeacher(editingTeacher.id, updates);
      } else {
        // When adding, destructure the password for the transactional function
        const { password, ...teacherData } = data; 
        
        // CRITICAL: Call addTeacher with two separate arguments
        await addTeacher(teacherData, password); 
      }

      toast({ title: "Success", description: `Teacher ${editingTeacher ? 'updated' : 'added'} successfully.` });
      setDialogOpen(false);
      await fetchTeachers();
    } catch (error) {
      console.error("Failed to save teacher:", error); 
      
      // IMPROVEMENT: Show the actual error message for better debugging
      toast({ 
          variant: "destructive", 
          title: "Error Creating Teacher", 
          description: error.message || "An unexpected error occurred during creation." 
      });
    }
  };

  // ... rest of the component (omitted for brevity)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teachers</h1>
        <Button onClick={handleAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          <span>Add New Teacher</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacher.short_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacher.designation}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{teacher.contact}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {teacher.availability?.join(', ') || 'All days'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(teacher)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(teacher.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={editingTeacher}
        onSave={handleSave}
      />
    </motion.div>
  );
};

export default TeachersManager;