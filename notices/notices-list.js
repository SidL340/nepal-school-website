/**
 * NOTICE BOARD CONFIGURATION
 * ===========================
 * To add a new notice:
 * 1. Place the notice image (.jpg or .png) in the /notices/ folder
 * 2. Add a new entry to the array below
 * 3. Save the file and push to GitHub — Vercel will auto-deploy
 *
 * Fields:
 *   id       : unique number
 *   title    : Notice title
 *   file     : filename inside /notices/ folder (e.g. "exam-routine.jpg")
 *   date     : date string (e.g. "2081-03-15")
 *   category : "Exam" | "Holiday" | "Meeting" | "Result" | "Admission" | "General"
 *   important: true | false  (true = red badge, false = gold badge)
 *
 * EXAMPLE — remove the comment markers to activate:
 * {
 *   id: 1,
 *   title: "Exam Routine - Final Examination 2081",
 *   file: "exam-routine-2081.jpg",
 *   date: "2081-03-01",
 *   category: "Exam",
 *   important: true
 * },
 */

const notices = [
  // Add your notices here
    {
    id: 1,
    title: "कक्षा ११ र १२ को नियममत पठिपाठि सञ्चालि सम्बन्धमा।",
    file: "classstart.jpg",
    date: "2081-03-01",
    category: "Exam",
    important: true
  },
     {
    id: 2,
    title: "कक्षा ",
    file: "classstart.jpg",
    date: "2081-03-01",
    category: "Exam",
    important: true
  },
];
