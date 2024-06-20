import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    if (token && userId) {
      setToken(token);
      setUserId(userId);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/emails/${userId}`);
        setEmails(response.data);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    if (userId && token) {
      fetchEmails();
    }
  }, [userId, token]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post('http://localhost:3000/emails/sync', { accessToken: token, userId: userId });
      // Optionally refetch emails after syncing
      const response = await axios.get(`http://localhost:3000/emails/${userId}`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error syncing emails:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/outlook';
  };

  return (
    <div className="app-container">
      <h1>Email Synchronizer</h1>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Log In with Outlook</button>
      ) : (
        <>
          <button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync Emails'}
          </button>
          {syncing && <p>Syncing emails, please wait...</p>}
          <ul className="email-list">
            {emails.map(email => (
              <li key={email.id} className="email-item">
                <strong>{email.subject}</strong> from {email.sender?.emailAddress?.address}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
