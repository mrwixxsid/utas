import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const BatchDialog = ({ open, onOpenChange, batch, courses, onSave }) => {
  const [formData, setFormData] = useState({
    batch_id: '',
    year: '',
    semester: '',
    student_count: '',
    course_ids: []
  });

  useEffect(() => {
    if (batch) {
      setFormData(batch);
    } else {
      setFormData({
        batch_id: '',
        year: '',
        semester: '',
        student_count: '',
        course_ids: []
      });
    }
  }, [batch, open]);

  const handleCourseToggle = (courseId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        course_ids: [...formData.course_ids, courseId]
      });
    } else {
      setFormData({
        ...formData,
        course_ids: formData.course_ids.filter(id => id !== courseId)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      year: parseInt(formData.year),
      semester: parseInt(formData.semester),
      student_count: parseInt(formData.student_count)
    });
  };

  const availableCourses = courses.filter(
    c => c.year === parseInt(formData.year) && c.semester === parseInt(formData.semester)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {batch ? 'Edit Batch' : 'Add New Batch'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
              <input
                type="text"
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="e.g., CSE-2024-A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
              <input
                type="number"
                value={formData.student_count}
                onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value, course_ids: [] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                required
              >
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value, course_ids: [] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          {formData.year && formData.semester && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Courses</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {availableCourses.length > 0 ? (
                  availableCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={course.id}
                        checked={formData.course_ids.includes(course.id)}
                        onCheckedChange={(checked) => handleCourseToggle(course.id, checked)}
                      />
                      <label htmlFor={course.id} className="text-sm text-gray-900">
                        {course.code} - {course.title} ({course.theory_or_lab})
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No courses available for selected year and semester</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {batch ? 'Update' : 'Add'} Batch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchDialog;