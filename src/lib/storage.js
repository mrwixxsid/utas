import { db as firebaseDb } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    query, 
    where, 
} from "firebase/firestore";

import { hashPassword } from "./auth.js"; // Required for new teacher creation


// -------------------------------
// DB OVERRIDE FOR seed.js (Keep this for consistency if used elsewhere)
// -------------------------------
export const db = firebaseDb;


// -------------------------------
// COLLECTION NAMES
// -------------------------------
const COL = {
    COURSES: "utas_courses",
    TEACHERS: "utas_teachers",
    ROOMS: "utas_rooms",
    BATCHES: "utas_batches",
    BATCH_COURSES: "utas_batch_courses",
    TIMETABLE: "utas_timetable",
    USERS: "utas_users",
    NOTIFICATIONS: "utas_swap_requests", // Swap requests act as notifications
};


// -------------------------------
// GENERIC HELPERS
// -------------------------------

/**
 * Fetches all documents from a specified collection.
 * @param {string} colName - The name of the Firestore collection.
 * @returns {Promise<Array<Object>>} Array of documents including their Firestore ID.
 */
export async function getItems(colName) {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Writes multiple documents to a collection using a batch operation.
 * Requires each item in the array to have a unique 'id' field to use as the document ID.
 * @param {string} colName - The name of the Firestore collection.
 * @param {Array<Object>} items - Array of data objects to write.
 */
export async function setItems(colName, items) {
    const batch = writeBatch(db);
    items.forEach(item => {
        // Ensure item.id exists for use as the document ID
        const ref = doc(collection(db, colName), item.id);
        batch.set(ref, item, { merge: true });
    });
    await batch.commit();
}

/**
 * Adds a new document to a collection with an auto-generated ID.
 * @param {string} colName - The name of the Firestore collection.
 * @param {Object} data - The data object to store.
 * @returns {Promise<Object>} The added document data including the new auto-generated ID.
 */
export async function addItem(colName, data) {
    const colRef = collection(db, colName);
    const docRef = await addDoc(colRef, data);
    return { id: docRef.id, ...data };
}

/**
 * Updates an existing document in a collection.
 * @param {string} colName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to update.
 * @param {Object} data - The partial data object to update.
 */
export async function updateItem(colName, id, data) {
    const docRef = doc(db, colName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
}

/**
 * Deletes a document from a collection.
 * @param {string} colName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to delete.
 */
export async function deleteItem(colName, id) {
    const docRef = doc(db, colName, id);
    await deleteDoc(docRef);
}

// -------------------------------
// SPECIFIC COLLECTION ACCESSORS (CRUD Operations)
// -------------------------------

// Courses
export const getCourses = () => getItems(COL.COURSES);
export const addCourse = (data) => addItem(COL.COURSES, data);
export const updateCourse = (id, data) => updateItem(COL.COURSES, id, data);
export const deleteCourse = (id) => deleteItem(COL.COURSES, id);

// Rooms
export const getRooms = () => getItems(COL.ROOMS);
export const addRoom = (data) => addItem(COL.ROOMS, data); 
export const updateRoom = (id, data) => updateItem(COL.ROOMS, id, data);
export const deleteRoom = (id) => deleteItem(COL.ROOMS, id);

// Batches
export const getBatches = () => getItems(COL.BATCHES);
export const addBatch = (data) => addItem(COL.BATCHES, data);
export const updateBatch = (id, data) => updateItem(COL.BATCHES, id, data);
export const deleteBatch = (id) => deleteItem(COL.BATCHES, id);

// Users
export const getUsers = () => getItems(COL.USERS);

// Timetable Functions (Entry-specific CRUD)
export const getTimetable = () => getItems(COL.TIMETABLE);
export const addTimetableEntry = (data) => addItem(COL.TIMETABLE, data); // For new entries
export const updateTimetableEntry = (id, data) => updateItem(COL.TIMETABLE, id, data); // <-- FIX ADDED HERE
export const deleteTimetableEntry = (id) => deleteItem(COL.TIMETABLE, id); // For removing entries
export const setTimetable = async (timetableEntries) => {
    // This function is for bulk overwrites/seeding
    await setItems(COL.TIMETABLE, timetableEntries);
};

// Notifications/Swap Requests
export const getNotifications = () => getItems(COL.NOTIFICATIONS);
export const addNotification = (data) => addItem(COL.NOTIFICATIONS, data); 
export const updateNotification = (id, data) => updateItem(COL.NOTIFICATIONS, id, data);
export const deleteNotification = (id) => deleteItem(COL.NOTIFICATIONS, id);


// --- TIMETABLE CLEANUP FUNCTION ---
/**
 * Deletes all existing documents from the timetable collection in a batch operation.
 */
export const deleteAllTimetableEntries = async () => {
    const snapshot = await getDocs(collection(db, COL.TIMETABLE));
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach(document => {
        batch.delete(document.ref);
    });
    await batch.commit();
    console.log(`Deleted ${snapshot.size} existing timetable entries.`);
};
// -------------------------------------------


// -------------------------------
// COMPLEX TEACHER/USER BATCH OPERATIONS
// -------------------------------

/**
 * Adds a new teacher profile and creates a corresponding user account with a hashed password.
 * This is a batched operation to ensure both documents are created successfully or neither are.
 * @param {object} teacherData - Profile data for the teacher (including email).
 * @param {string} password - The cleartext password for the new user account.
 * @returns {Promise<{teacher: object, user: object}>} The created teacher and user documents.
 */
export async function addTeacher(teacherData, password) {
    const batch = writeBatch(db);

    // 1. Generate a new ID for the Teacher document
    const teacherRef = doc(collection(db, COL.TEACHERS));
    const teacherId = teacherRef.id;
    
    // 2. Hash the password for the User document
    const password_hash = await hashPassword(password);
    
    // 3. Prepare the Teacher document (use the generated ID)
    const { password: _, ...teacherProfileData } = teacherData;

    const teacherDoc = {
        id: teacherId,
        ...teacherProfileData,
        created_at: new Date().toISOString(),
    };

    // 4. Prepare the User document (use the generated Teacher ID as the teacher_id)
    const userDoc = {
        id: `user-${teacherId}`, 
        email: teacherData.email,
        password_hash: password_hash,
        role: "teacher",
        teacher_id: teacherId, 
        created_at: new Date().toISOString(),
    };
    const userRef = doc(collection(db, COL.USERS), userDoc.id);

    // 5. Add both to the batch
    batch.set(teacherRef, teacherDoc);
    batch.set(userRef, userDoc);

    // 6. Commit the batch
    await batch.commit();

    return { teacher: teacherDoc, user: userDoc };
}

// Teacher CRUD (updated to use new addTeacher)
export const addTeacherAndUser = addTeacher; // Alias for clarity

export const getTeachers = () => getItems(COL.TEACHERS);
export const updateTeacher = (id, data) => updateItem(COL.TEACHERS, id, data);
export const deleteTeacher = (id) => deleteItem(COL.TEACHERS, id);