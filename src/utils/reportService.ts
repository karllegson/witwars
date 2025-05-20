import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface ProblemReport {
  userId: string;
  username: string;
  reportText: string;
  timestamp: Timestamp;
  status: 'pending' | 'reviewed' | 'resolved';
}

/**
 * Submit a problem report to the database
 */
export const submitProblemReport = async (userId: string, username: string, reportText: string): Promise<string> => {
  try {
    const reportData: ProblemReport = {
      userId,
      username,
      reportText,
      timestamp: Timestamp.now(),
      status: 'pending'
    };
    
    const docRef = await addDoc(collection(db, 'problemReports'), reportData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error submitting problem report:', error);
    throw new Error(`Failed to submit report: ${error.message}`);
  }
};

/**
 * Get all problem reports for admin review
 */
export const getAllProblemReports = async (): Promise<(ProblemReport & { id: string })[]> => {
  try {
    const q = query(
      collection(db, 'problemReports'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports: (ProblemReport & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data() as ProblemReport
      });
    });
    
    return reports;
  } catch (error: any) {
    console.error('Error fetching problem reports:', error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
};

/**
 * Get problem reports by user ID
 */
export const getUserProblemReports = async (userId: string): Promise<(ProblemReport & { id: string })[]> => {
  try {
    const q = query(
      collection(db, 'problemReports'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports: (ProblemReport & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data() as ProblemReport
      });
    });
    
    return reports;
  } catch (error: any) {
    console.error('Error fetching user problem reports:', error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
};
