import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const CourseDialog = ({ open, onOpenChange, course, teachers, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Theory',
    credits: '',
    contact_hours: '',
    marks: 100,
    assigned_teacher_id: '',
    year: '',
    semester: ''
  });

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        name: course.name || course.title,
        type: course.type || course.theory_or_lab
      });
    } else {
      setFormData({
        code: '',
        name: '',
        type: 'Theory',
        credits: '',
        contact_hours: '',
        marks: 100,
        assigned_teacher_id: '',
        year: '',
        semester: ''
      });
    }
  }, [course, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      credits: parseFloat(formData.credits),
      contact_hours: parseInt(formData.contact_hours),
      marks: parseInt(formData.marks),
      year: parseInt(formData.year),
      semester: parseInt(formData.semester)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {course ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white">
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <input type="number" step="0.5" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Hours</label>
              <input type="number" value={formData.contact_hours} onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
              <input type="number" value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher</label>
              <select value={formData.assigned_teacher_id} onChange={(e) => setFormData({ ...formData, assigned_teacher_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required>
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" required >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{course ? 'Update' : 'Add'} Course</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDialog;