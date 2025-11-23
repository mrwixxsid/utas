import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; 
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const TeacherDialog = ({ open, onOpenChange, teacher, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    designation: '',
    contact: '',
    email: '', 
    password: '', 
    availability: DAYS
  });

  const isEditing = !!teacher;

  useEffect(() => {
    if (teacher) {
      setFormData({
        ...teacher,
        email: teacher.email || '', 
        password: '', // Never pre-fill the password
        availability: teacher.availability || DAYS
      });
    } else {
      setFormData({
        name: '', short_name: '', designation: '', contact: '',
        email: '', password: '', availability: DAYS,
      });
    }
  }, [teacher, open]);

  // FIX 1: Defined handleChange function
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // FIX 2: Defined handleAvailabilityChange function (used by Checkbox)
  const handleAvailabilityChange = (day, checked) => {
    let newAvailability;
    if (checked) {
      // Add day
      newAvailability = [...formData.availability, day];
    } else {
      // Remove day
      newAvailability = formData.availability.filter(d => d !== day);
    }
    setFormData({ ...formData, availability: newAvailability });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // CRITICAL VALIDATION: Require password only on creation
    if (!isEditing && !formData.password) {
      alert("Password is required for a new teacher account.");
      return;
    }
    onSave(formData);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. Dr. John Smith"
            />
          </div>

          {/* Short Name */}
          <div>
            <label htmlFor="short_name" className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
            <input
              id="short_name"
              type="text"
              name="short_name"
              required
              value={formData.short_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. J.Smith"
            />
          </div>

          {/* Designation */}
          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
            <input
              id="designation"
              type="text"
              name="designation"
              required
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. Associate Professor"
            />
          </div>

          {/* Email Field - Should be present for both add and edit */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="Used as login username"
            />
          </div>

          {/* Password Field - ONLY REQUIRED/DISPLAYED FOR ADDING A NEW TEACHER */}
          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required={!isEditing} // Required only when adding
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="Initial password for login"
              />
            </div>
          )}
          
          {/* Contact */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
            <input
              id="contact"
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="e.g. Phone number or personal email"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <div className="grid grid-cols-3 gap-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`availability-${day}`}
                    checked={formData.availability.includes(day)}
                    onCheckedChange={(checked) => handleAvailabilityChange(day, checked)}
                  />
                  <label htmlFor={`availability-${day}`} className="text-sm text-gray-900">{day}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditing ? 'Update' : 'Add'} Teacher
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDialog;