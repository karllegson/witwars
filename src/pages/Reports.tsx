import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import RetroWindow from '../components/RetroWindow';
import AppContainer from '../components/AppContainer';
import RetroButton from '../components/RetroButton';
import { getAllProblemReports } from '../utils/reportService.js';

const Content = styled.div`
  padding: 16px;
  color: #fff;
`;

const ReportList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ReportItem = styled.div`
  background: #232323;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 12px;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px dashed #444;
  margin-bottom: 8px;
`;

const ReportUser = styled.div`
  font-weight: bold;
  color: #ffcc00;
`;

const ReportTime = styled.div`
  color: #999;
  font-size: 14px;
`;

const ReportContent = styled.div`
  margin: 12px 0;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ReportStatus = styled.div<{ status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${({ status }) => {
    switch (status) {
      case 'resolved': return '#2d6a4f';
      case 'reviewed': return '#264653';
      default: return '#5e503f'; // pending
    }
  }};
  color: #fff;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #999;
  font-size: 18px;
`;

interface Report {
  id: string;
  userId: string;
  username: string;
  reportText: string;
  timestamp: {
    toDate: () => Date;
  };
  status: 'pending' | 'reviewed' | 'resolved';
}

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only admin users should access this page
    // For now, we'll just check if the user is logged in
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const reportsData = await getAllProblemReports();
        setReports(reportsData as Report[]);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [currentUser, navigate]);

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppContainer>
      <Header title="WITWARS" subtitle="Admin" />
      <RetroWindow title="USER.REPORTS">
        <Content>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'VT323, monospace', color: '#ffcc00', margin: 0 }}>Problem Reports</h2>
            <RetroButton title="Back" onClick={() => navigate('/')} />
          </div>
          
          {loading ? (
            <EmptyState>Loading reports...</EmptyState>
          ) : error ? (
            <EmptyState>Error: {error}</EmptyState>
          ) : reports.length === 0 ? (
            <EmptyState>No reports found</EmptyState>
          ) : (
            <ReportList>
              {reports.map((report) => (
                <ReportItem key={report.id}>
                  <ReportHeader>
                    <ReportUser>{report.username}</ReportUser>
                    <ReportTime>{formatDate(report.timestamp.toDate())}</ReportTime>
                  </ReportHeader>
                  <ReportContent>{report.reportText}</ReportContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ReportStatus status={report.status}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </ReportStatus>
                    <div style={{ fontSize: '12px', color: '#999' }}>ID: {report.id}</div>
                  </div>
                </ReportItem>
              ))}
            </ReportList>
          )}
        </Content>
      </RetroWindow>
    </AppContainer>
  );
};

export default ReportsPage;
