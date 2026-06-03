import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'backend', 'config', 'db.json');

// Ensure parent directory exists
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'teacher' | 'student';
  department?: string;
  capacity?: number; // for teachers, defaults to 4
  acceptedGroups?: number; // for teachers, count of accepted groups
  isGroup?: boolean; // for student accounts
  rollNumber?: string; // for individual student or lead
}

export interface ProjectComment {
  userName: string;
  role: string;
  message: string;
  date: string;
}

export interface Project {
  id: string;
  projectTitle: string;
  description: string;
  teacherId: string;
  teacherName: string;
  status: 'pending' | 'approved' | 'rejected';
  isCompleted: boolean;
  fileUrl: string; // captured filename, or fallback label
  submittedAt: string;
  type: 'individual' | 'group';
  members: Array<{
    name: string;
    rollNumber: string;
    department: string;
    email: string;
  }>;
  comments: ProjectComment[];
}

export interface Evaluation {
  groupId: string; // Project ID
  studentId: string; // Student rollNumber or Email
  studentName: string;
  totalScore: number;
  grade: string;
  feedback: string;
  evaluatorId: string; // Teacher ID
  date: string;
  scores: {
    presentationSkills: number;
    questionAnswer: number;
    toolsUsed: number;
    backendExplanation: number;
    communication: number;
    professionalism: number;
    confidence: number;
    demonstration: number;
    knowledge: number;
  };
}

export interface DBStore {
  users: User[];
  projects: Project[];
  evaluations: Evaluation[];
}

let dbCache: DBStore | null = null;

function loadDB(): DBStore {
  if (dbCache) return dbCache;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (e) {
      console.error('Error reading JSON DB, initializing fresh.', e);
    }
  }

  // Generate initial salt and hashes for predefined seeds
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123', salt);
  const teacherHash = bcrypt.hashSync('teacher123', salt);
  const teacherFatimaHash = bcrypt.hashSync('teacher123', salt);

  const initialDB: DBStore = {
    users: [
      {
        id: 'admin-1',
        name: 'System Admin',
        email: 'admin@fyp.com',
        passwordHash: adminHash,
        role: 'admin'
      },
      {
        id: 'teacher-1',
        name: 'Dr. Asad Ahmed',
        email: 'teacher@fyp.com',
        role: 'teacher',
        passwordHash: teacherHash,
        department: 'CS',
        capacity: 4,
        acceptedGroups: 0
      },
      {
        id: 'teacher-2',
        name: 'Dr. Fatima Zafar',
        email: 'fatima@fyp.com',
        role: 'teacher',
        passwordHash: teacherFatimaHash,
        department: 'CS',
        capacity: 4,
        acceptedGroups: 0
      }
    ],
    projects: [
      {
        id: 'proj-1',
        projectTitle: 'AI-Based Crop Disease Detection',
        description: 'An image classification project identifying leaf blight in potato crops.',
        teacherId: 'teacher-1',
        teacherName: 'Dr. Asad Ahmed',
        status: 'rejected',
        isCompleted: false,
        fileUrl: '',
        submittedAt: '2026-06-01',
        type: 'individual',
        members: [{ name: 'Ali Raza', rollNumber: '001', department: 'CS', email: 'ali@student.com' }],
        comments: []
      },
      {
        id: 'proj-2',
        projectTitle: 'Blockchain Voting System',
        description: 'A decentralized electronic voting network guaranteeing anonymity and fraud protection.',
        teacherId: 'teacher-1',
        teacherName: 'Dr. Asad Ahmed',
        status: 'approved',
        isCompleted: false,
        fileUrl: '',
        submittedAt: '2026-05-30',
        type: 'individual',
        members: [{ name: 'Ayesha Khan', rollNumber: '008', department: 'CS', email: 'ayesha@student.com' }],
        comments: [
          { userName: 'Dr. Asad Ahmed', role: 'teacher', message: 'Interesting proposal, let\'s proceed.', date: '2026-05-31 10:20 AM' }
        ]
      }
    ],
    evaluations: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  dbCache = initialDB;
  return dbCache;
}

function saveDB(store: DBStore) {
  dbCache = store;
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function getUsers(): User[] {
  return loadDB().users;
}

export function saveUsers(users: User[]) {
  const store = loadDB();
  store.users = users;
  saveDB(store);
}

export function getProjects(): Project[] {
  return loadDB().projects;
}

export function saveProjects(projects: Project[]) {
  const store = loadDB();
  store.projects = projects;
  saveDB(store);
}

export function getEvaluations(): Evaluation[] {
  return loadDB().evaluations;
}

export function saveEvaluations(evals: Evaluation[]) {
  const store = loadDB();
  store.evaluations = evals;
  saveDB(store);
}
