import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';

const SwapRequestDialog = ({ open, onOpenChange, swapDetails, onConfirm }) => {
  if (!swapDetails) return null;

  const { from, to } = swapDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Confirm Swap Request</DialogTitle>
        </DialogHeader>
        <div className="my-4 space-y-4">
          <p className="text-sm text-gray-600">
            You are about to request a swap with <span className="font-semibold">{to.teacher_name}</span>. Please confirm the details below.
          </p>
          <div className="flex items-center justify-between space-x-2">
            {/* Your Class */}
            <div className="flex-1 p-3 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-800">Your Class</h4>
              <p className="text-sm text-gray-700">{from.course_code}</p>
              <p className="text-xs text-gray-500">{from.day}, {from.time_slot}</p>
            </div>

            <ArrowRightLeft className="w-6 h-6 text-blue-500" />

            {/* Their Class */}
            <div className="flex-1 p-3 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-800">{to.teacher_name}'s Class</h4>
              <p className="text-sm text-gray-700">{to.course_code}</p>
              <p className="text-xs text-gray-500">{to.day}, {to.time_slot}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapRequestDialog;