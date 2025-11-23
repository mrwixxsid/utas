import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { db } from '@/lib/storage'; // Firestore instance
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import BatchDialog from './BatchDialog';

const BatchesManager = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Load batches
      const batchSnapshot = await getDocs(collection(db, 'utas_batches'));
      const batchesData = batchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Load courses
      const courseSnapshot = await getDocs(collection(db, 'utas_courses'));
      const coursesData = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setBatches(batchesData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading batches', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load batches' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingBatch(null);
    setDialogOpen(true);
  };

  const handleEdit = async (batch) => {
    try {
      // Load batch_courses for this batch
      const q = query(collection(db, 'utas_batch_courses'), where('batch_id', '==', batch.id));
      const snapshot = await getDocs(q);
      const course_ids = snapshot.docs.map(doc => doc.data().course_id);

      setEditingBatch({ ...batch, course_ids });
      setDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load batch courses' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'utas_batches', id));

      // Delete related batch_courses
      const q = query(collection(db, 'utas_batch_courses'), where('batch_id', '==', id));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docItem) => {
        await deleteDoc(doc(db, 'utas_batch_courses', docItem.id));
      });

      toast({ title: 'Success', description: 'Batch deleted successfully' });
      loadData();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete batch' });
    }
  };

  const handleSave = async (batchData) => {
    const { course_ids, ...rest } = batchData;

    try {
      let batchId = editingBatch ? editingBatch.id : null;

      if (editingBatch) {
        await updateDoc(doc(db, 'utas_batches', batchId), rest);
        toast({ title: 'Success', description: 'Batch updated successfully' });
      } else {
        const docRef = await addDoc(collection(db, 'utas_batches'), rest);
        batchId = docRef.id;
        toast({ title: 'Success', description: 'Batch added successfully' });
      }

      // Update batch_courses
      const q = query(collection(db, 'utas_batch_courses'), where('batch_id', '==', batchId));
      const snapshot = await getDocs(q);

      // Delete old courses
      snapshot.forEach(async (docItem) => {
        await deleteDoc(doc(db, 'utas_batch_courses', docItem.id));
      });

      // Add new courses
      for (const course_id of course_ids) {
        await addDoc(collection(db, 'utas_batch_courses'), {
          batch_id: batchId,
          course_id,
          created_at: new Date().toISOString()
        });
      }

      loadData();
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save batch' });
    }
  };

  const getCourseCount = async (batchId) => {
    const q = query(collection(db, 'utas_batch_courses'), where('batch_id', '==', batchId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-gray-500"/></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Batches Management</h2>
        <Button onClick={handleAdd} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Add Batch</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Batch ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Semester</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student Count</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Assigned Courses</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map(batch => (
              <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">{batch.batch_id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{batch.year}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{batch.semester}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{batch.student_count}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {/* Could fetch course count asynchronously if needed */}
                  <BatchCourseCount batchId={batch.id} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(batch)} variant="outline" size="sm" className="hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(batch.id)} variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BatchDialog open={dialogOpen} onOpenChange={setDialogOpen} batch={editingBatch} courses={courses} onSave={handleSave} />
    </motion.div>
  );
};

// Component to asynchronously display course count per batch
const BatchCourseCount = ({ batchId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const q = query(collection(db, 'utas_batch_courses'), where('batch_id', '==', batchId));
      const snapshot = await getDocs(q);
      setCount(snapshot.size);
    };
    fetchCount();
  }, [batchId]);

  return <span>{count} courses</span>;
};

export default BatchesManager;
