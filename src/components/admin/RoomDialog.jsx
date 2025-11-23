import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const RoomDialog = ({ open, onOpenChange, room, onSave }) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'Class',
    capacity: ''
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    } else {
      setFormData({
        number: '',
        type: 'Class',
        capacity: ''
      });
    }
  }, [room, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      capacity: parseInt(formData.capacity)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="Class">Class</option>
              <option value="Lab">Lab</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {room ? 'Update' : 'Add'} Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDialog;