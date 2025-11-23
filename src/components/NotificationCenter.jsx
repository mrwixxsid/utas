import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check, X } from 'lucide-react';

const NotificationCenter = ({ notifications, currentUserId, onAction, unreadCount }) => {
  const incomingRequests = notifications.filter(n => n.to_teacher_id === currentUserId && n.status === 'pending');
  const outgoingRequests = notifications.filter(n => n.from_teacher_id === currentUserId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-gray-900">Notifications</h4>
            <p className="text-sm text-gray-500">
              You have {incomingRequests.length} incoming swap requests.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-center text-gray-500 py-4">No notifications yet.</p>
            ) : (
              <>
                {incomingRequests.length > 0 && <h5 className="text-sm font-semibold text-gray-800">Incoming Requests</h5>}
                {incomingRequests.map(n => (
                  <div key={n.id} className="p-2 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{n.from_teacher_name}</span> wants to swap their <span className="font-semibold">{n.from_course_code}</span> class on {n.from_day} at {n.from_time_slot} with your <span className="font-semibold">{n.to_course_code}</span> class on {n.to_day} at {n.to_time_slot}.
                    </p>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button size="sm" variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200" onClick={() => onAction(n.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200" onClick={() => onAction(n.id, 'rejected')}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}

                {outgoingRequests.length > 0 && <h5 className="text-sm font-semibold text-gray-800 mt-4">Outgoing Requests</h5>}
                {outgoingRequests.map(n => (
                  <div key={n.id} className="p-2 bg-gray-50 rounded-md border">
                     <p className="text-sm text-gray-700">
                      Your request to <span className="font-semibold">{n.to_teacher_name}</span> to swap classes is <span className={`font-semibold ${
                        n.status === 'pending' ? 'text-yellow-600' : n.status === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>{n.status}</span>.
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;