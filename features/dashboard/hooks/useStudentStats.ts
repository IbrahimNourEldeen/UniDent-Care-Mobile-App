import { useState, useEffect } from 'react';

export interface UpcomingSession {
  id: string;
  patientInitials: string;
  treatmentType: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface ActivityItem {
  id: string;
  type: 'case_approved' | 'session_completed' | 'new_request';
  title: string;
  timestamp: string;
}

export function useStudentStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedSessions: 0,
    totalSessions: 0,
    totalCases: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Mock simulation delay
    const timer = setTimeout(() => {
      setStats({
        totalRequests: 24,
        pendingRequests: 5,
        approvedRequests: 19,
        completedSessions: 8,
        totalSessions: 12,
        totalCases: 15,
      });

      setUpcomingSessions([
        {
          id: '1',
          patientInitials: 'A.M',
          treatmentType: 'Root Canal',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'Scheduled',
        },
        {
          id: '2',
          patientInitials: 'S.K',
          treatmentType: 'Scaling',
          scheduledAt: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          status: 'Scheduled',
        }
      ]);

      setRecentActivity([
        {
          id: 'a1',
          type: 'case_approved',
          title: 'Case #4521 Approved by Dr. Ahmed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'a2',
          type: 'session_completed',
          title: 'Scaling Session with P. J. Completed',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        }
      ]);

      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const requestApprovalRate = stats.totalRequests > 0 
    ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) 
    : 0;

  const sessionProgress = stats.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
    : 0;

  return { stats, upcomingSessions, recentActivity, loading, sessionProgress, requestApprovalRate };
}
