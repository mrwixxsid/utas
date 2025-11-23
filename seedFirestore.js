import admin from "firebase-admin";
import fs from "fs";

// Load service account key
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ---- NEW: USERS SEED DATA ----
const users = [
  {
    id: "user-admin",
    email: "admin@utas.edu",
    password: "admin123",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-teacher1",
    email: "teacher1@utas.edu",
    password: "teacher123",
    role: "teacher",
    teacher_id: "teacher-1",
    created_at: new Date().toISOString(),
  },
  {
    id: "user-student1",
    email: "student@utas.edu",
    password: "student123",
    role: "student",
    batch_id: "batch-2024-Y1S1",
    created_at: new Date().toISOString(),
  },
];

// ---- EXISTING PROGRAM/YEAR/COURSE DATA (unchanged) ----
const data = {
  programs: {
    cse: {
      name: "Computer Science & Engineering",
      code: "CSE",
      years: {
        1: {
          semesters: {
            1: {
              courses: {
                CSE1101: { courseCode: "CSE1101", courseName: "Introduction to Computer System", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1102: { courseCode: "CSE1102", courseName: "Structured Programming Language", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1103: { courseCode: "CSE1103", courseName: "Structured Programming Language Lab", type: "Lab", credits: 2, contactHours: 72, marks: 100 },
                CSE1104: { courseCode: "CSE1104", courseName: "Math-I(Calculus)", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1105: { courseCode: "CSE1105", courseName: "Physics(Electricity, Magnetism & Optics)", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1106: { courseCode: "CSE1106", courseName: "Environment Science", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1107: { courseCode: "CSE1107", courseName: "English Reading Skills & Public Speaking", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1108: { courseCode: "CSE1108", courseName: "Bengali", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1109: { courseCode: "CSE1109", courseName: "Viva Voce", type: "", credits: 1, contactHours: 0, marks: 100 },
              },
            },

            2: {
              courses: {
                CSE1201: { courseCode: "CSE1201", courseName: "Object Oriented Programming Language(C++)", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1202: { courseCode: "CSE1202", courseName: "Object Oriented Programming Language(C++) Lab", type: "Lab", credits: 2, contactHours: 72, marks: 100 },
                CSE1203: { courseCode: "CSE1203", courseName: "Electrical & Electronics Circuits", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1204: { courseCode: "CSE1204", courseName: "Electrical & Electronics Circuits Lab", type: "Lab", credits: 2, contactHours: 72, marks: 100 },
                CSE1205: { courseCode: "CSE1205", courseName: "Engineering Drawing and CAD Lab", type: "Lab", credits: 2, contactHours: 72, marks: 100 },
                CSE1206: { courseCode: "CSE1206", courseName: "Discrete Mathematics", type: "Theory", credits: 3, contactHours: 54, marks: 100 },
                CSE1207: { courseCode: "CSE1207", courseName: "Math-II(Co-ordinate Geometry & Vector Analysis)", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1208: { courseCode: "CSE1208", courseName: "English Writing Skills and Communications", type: "Theory", credits: 2, contactHours: 36, marks: 100 },
                CSE1209: { courseCode: "CSE1209", courseName: "Viva Voce", type: "", credits: 1, contactHours: 0, marks: 100 },
              },
            },
          },
        },

        // YEAR 2, 3, 4 — UNCHANGED (your original content)
        // ...
      },
    },
  },
};

// -------------------------------------------------

async function seed() {
  console.log("⏳ Importing...");

  // --- NEW: Seed Users Collection ---
  console.log("📌 Adding users...");
  for (const user of users) {
    await db.collection("users").doc(user.id).set(user);
  }

  // --- Existing Program/Year/Semester/Course Seeder ---
  for (const [programId, programData] of Object.entries(data.programs)) {
    await db.collection("programs").doc(programId).set({
      name: programData.name,
      code: programData.code,
    });

    if (programData.years) {
      for (const [yearId, yearData] of Object.entries(programData.years)) {
        await db
          .collection("programs")
          .doc(programId)
          .collection("years")
          .doc(yearId)
          .set({ yearNumber: Number(yearId) });

        if (yearData.semesters) {
          for (const [semesterId, semesterData] of Object.entries(yearData.semesters)) {
            await db
              .collection("programs")
              .doc(programId)
              .collection("years")
              .doc(yearId)
              .collection("semesters")
              .doc(semesterId)
              .set({ semesterNumber: Number(semesterId) });

            if (semesterData.courses) {
              for (const [courseId, course] of Object.entries(semesterData.courses)) {
                await db
                  .collection("programs")
                  .doc(programId)
                  .collection("years")
                  .doc(yearId)
                  .collection("semesters")
                  .doc(semesterId)
                  .collection("courses")
                  .doc(courseId)
                  .set(course);
              }
            }
          }
        }
      }
    }
  }

  console.log("✅ Import completed!");
  process.exit();
}

seed();
