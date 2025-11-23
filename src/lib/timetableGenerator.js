
import { 
  getCourses, 
  getTeachers, 
  getRooms, 
  getBatches, 
  getItems, 
} from './storage'; 

// --- 1. FIXED TIME SLOTS (Refined for Lunch Break and consistent with grid) ---
const TIME_SLOTS = [
  '8:45-9:35',
  '9:40-10:30',
  '10:35-11:25',
  '11:30-12:20',
  'LUNCH',
  '2:00-2:50',
  '2:55-3:45',
  '3:50-4:40'
];

// ✅ FIXED: DAYS MUST MATCH TimetableGrid.jsx EXACTLY
// Sunday–Thursday only. Friday & Saturday OFF.
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// --- 2. COST DEFINITIONS ---
const COST = {
    CONTINUOUS_CLASS: 10,
    SCARCE_RESOURCE: 5,
    GAPS_LATE_DAY: 4,
    UNDESIRABLE_TIME: 2,
    BASE: 1
};

// --- 3. HELPER FUNCTIONS ---

const isRoomAvailable = (room, course, groupSize, scheduleEntry) => {
  if (room.capacity < groupSize) return false;
  if (course.type === 'Lab' && room.type !== 'Lab') return false;
  if (scheduleEntry.rooms.has(room.id)) return false;
  return true;
};

const isSlotAvailable = (scheduleEntry, teacher, batch, day, teacherAvailability) => {
  if (scheduleEntry.teachers.has(teacher.id)) return false;
  if (scheduleEntry.batches.has(batch.id)) return false;
  if (teacherAvailability && !teacherAvailability.includes(day)) return false;
  return true;
};

const calculateSlotCost = (day, slotIndex, teacher, batch, scheduleGrid) => {
    let cost = COST.BASE;
    
    let teacherContinuousCount = 0;
    let batchContinuousCount = 0;
    
    for (let i = 1; i <= 2; i++) {
        const prevSlotIndex = slotIndex - i;
        if (prevSlotIndex >= 0 && TIME_SLOTS[prevSlotIndex] !== 'LUNCH') {
            const prevKey = `${day}-${TIME_SLOTS[prevSlotIndex]}`;
            const prevEntry = scheduleGrid[prevKey];

            if (prevEntry.teachers.has(teacher.id)) teacherContinuousCount++;
            if (prevEntry.batches.has(batch.id)) batchContinuousCount++;
        }
    }
    
    if (teacherContinuousCount === 2) cost += COST.CONTINUOUS_CLASS;
    if (batchContinuousCount === 2) cost += COST.CONTINUOUS_CLASS;

    if (slotIndex === 0 || slotIndex >= 6) cost += COST.UNDESIRABLE_TIME;

    if (slotIndex >= 5) { 
        let dayEmptyBefore = true;
        for (let i = 0; i < slotIndex; i++) {
            const prevKey = `${day}-${TIME_SLOTS[i]}`;
            if (TIME_SLOTS[i] !== 'LUNCH' && scheduleGrid[prevKey].batches.has(batch.id)) {
                dayEmptyBefore = false;
                break;
            }
        }
        if (dayEmptyBefore) {
            cost += COST.GAPS_LATE_DAY * 2; 
        }
    }
    return cost;
};

// --- 4. MAIN GENERATOR FUNCTION ---
export const generateTimetable = async () => {
  try {
    const [courses, teachers, rooms, batches, batchCourses] = await Promise.all([
      getCourses(), getTeachers(), getRooms(), getBatches(), getItems('utas_batch_courses')
    ]);

    if (batches.length === 0 || courses.length === 0 || rooms.length === 0) {
        return { success: false, message: "Missing Batches, Courses, or Rooms data." };
    }

    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    const scheduleGrid = {};
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(slot => {
        const key = `${day}-${slot}`;
        scheduleGrid[key] = { rooms: new Set(), teachers: new Set(), batches: new Set() };
      });
    });

    let assignments = [];
    const NUM_WEEKS = 20;

    for (const bc of batchCourses) {
        const batch = batches.find(b => b.id === bc.batch_id);
        const course = courses.find(c => c.id === bc.course_id);
        const teacher = teacherMap.get(course.assigned_teacher_id);
        
        if (!batch || !course || !teacher) continue;

        const weeklyHours = Math.ceil((course.contact_hours || 0) / NUM_WEEKS); 
        
        for(let i = 0; i < weeklyHours; i++) {
            assignments.push({ 
                batch, 
                course, 
                teacher,
                teacherAvailability: teacher.availability || DAYS,
                isLab: course.type === 'Lab',
                batchSize: batch.student_count
            });
        }
    }

    assignments.sort((a, b) => {
        if (a.isLab && !b.isLab) return -1;
        if (!a.isLab && b.isLab) return 1;
        return a.teacherAvailability.length - b.teacherAvailability.length;
    });
    
    const timetable = [];
    const failedAssignmentsBacklog = [];

    for (const assignment of assignments) {
      const { batch, course, teacher, isLab, batchSize, teacherAvailability } = assignment;
      
      let groups = [{ name: null, students: batchSize }];
      if (isLab && batchSize > 25) {
          groups = [
              { name: 'G1', students: Math.ceil(batchSize / 2) },
              { name: 'G2', students: Math.floor(batchSize / 2) },
          ];
      }
      
      for (const { name: group, students: groupSize } of groups) {
        let bestSlot = null;
        let minCost = Infinity;

        for (let i = 0; i < DAYS.length; i++) {
          const day = DAYS[i];
          
          for (let j = 0; j < TIME_SLOTS.length; j++) {
            const slot = TIME_SLOTS[j];
            if (slot === 'LUNCH') continue; 

            const key = `${day}-${slot}`;
            const scheduleEntry = scheduleGrid[key];

            if (!isSlotAvailable(scheduleEntry, teacher, batch, day, teacherAvailability)) continue; 

            const availableRooms = rooms.filter(room => 
                isRoomAvailable(room, course, groupSize, scheduleEntry)
            );

            if (availableRooms.length > 0) {
                let currentCost = calculateSlotCost(day, j, teacher, batch, scheduleGrid);
                
                const roomToUse = availableRooms[0];
                if (isLab && availableRooms.length <= 2) {
                    currentCost += COST.SCARCE_RESOURCE; 
                }

                if (currentCost < minCost) {
                    minCost = currentCost;
                    bestSlot = { day, slot, room: roomToUse, group, groupSize };
                }
            }
          }
        }

        if (bestSlot) {
            const { day, slot, room, group, groupSize } = bestSlot;
            const key = `${day}-${slot}`;
            
            scheduleGrid[key].teachers.add(teacher.id);
            scheduleGrid[key].batches.add(batch.id);
            scheduleGrid[key].rooms.add(room.id);

            timetable.push({
                id: `tt-${day}-${slot}-${batch.id}-${course.id}-${group || 'none'}`,
                batch_id: batch.id,
                course_id: course.id,
                teacher_id: teacher.id,
                room_id: room.id,
                day,
                time_slot: slot,
                group,
                course_code: course.code, 
                course_name: course.name,
                batch_name: batch.batch_id,
                teacher_name: teacher.short_name || teacher.name,
                room_number: room.number,
                group_size: groupSize,
            });
        } else {
            failedAssignmentsBacklog.push(assignment);
        }
      }
    }

    return { 
        success: true, 
        timetable, 
        failedAssignmentsCount: failedAssignmentsBacklog.length 
    };
  } catch (error) {
    console.error("Error generating timetable:", error);
    return { success: false, message: error.message };
  }
};
