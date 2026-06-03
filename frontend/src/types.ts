export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  department?: string;
  capacity?: number;
  acceptedGroups?: number;
  isGroup?: boolean;
  rollNumber?: string;
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
  fileUrl: string;
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
  groupId: string;
  studentId: string;
  studentName: string;
  totalScore: number;
  grade: string;
  feedback: string;
  evaluatorId: string;
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
