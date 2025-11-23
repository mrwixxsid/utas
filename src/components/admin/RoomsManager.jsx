import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getRooms, addRoom, updateRoom, deleteRoom } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import RoomDialog from './RoomDialog';

const RoomsManager = () => {
  const [rooms, setRooms] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const { toast } = useToast();

  // Fetch data function
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load rooms" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAdd = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id);
      toast({ title: "Success", description: "Room deleted successfully" });
      await fetchRooms(); // Refresh list
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete room" });
    }
  };

  const handleSave = async (roomData) => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
        toast({ title: "Success", description: "Room updated successfully" });
      } else {
        await addRoom(roomData);
        toast({ title: "Success", description: "Room added successfully" });
      }
      await fetchRooms(); // Refresh list
      setDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save room" });
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
        <Button onClick={handleAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Room Number</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Capacity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">{room.number}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    room.type === 'Class' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {room.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{room.capacity}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(room)} variant="outline" size="sm" className="hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(room.id)} variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editingRoom}
        onSave={handleSave}
      />
    </motion.div>
  );
};

export default RoomsManager;