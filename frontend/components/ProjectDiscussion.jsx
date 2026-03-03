import React, { useState, useEffect, useRef } from 'react';
import {
  joinProjectRoom,
  leaveProjectRoom,
  sendMessage,
  onMessageReceived,
  offMessageReceived,
  notifyTyping,
  notifyStoppedTyping,
} from '../utils/socket';
import { getProjectComments, addProjectComment, deleteProjectComment, updateCommentStatus } from '../services/api';
import styles from './ProjectDiscussion.module.css';

const ProjectDiscussion = ({ projectId, userRole, userId, userName }) => {
  // Guard: don't render if missing required props - BEFORE any hooks
  if (!userId || !userName) {
    return null;
  }

  // If projectId is loading, show loading state
  if (!projectId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        color: '#667eea'
      }}>
        Loading discussion...
      </div>
    );
  }

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await getProjectComments(projectId, 1, 50);
        if (response.success) {
          setMessages(response.data || []);
          setHasMore(response.pagination?.hasMore || false);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadMessages();
    }
  }, [projectId]);

  // Join project room and listen for messages
  useEffect(() => {
    joinProjectRoom(projectId, userId, userRole);

    const handleReceiveMessage = (data) => {
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    };

    onMessageReceived(handleReceiveMessage);

    return () => {
      leaveProjectRoom(projectId, userId);
      offMessageReceived(handleReceiveMessage);
    };
  }, [projectId, userId, userRole]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      const response = await addProjectComment(projectId, inputValue.trim());
      if (response.success) {
        setInputValue('');
        notifyStoppedTyping(projectId, userId);
        
        // Broadcast via WebSocket
        sendMessage(projectId, inputValue.trim(), userId, userName, userRole);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Notify typing
    notifyTyping(projectId, userId, userName);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to notify stopped typing
    typingTimeoutRef.current = setTimeout(() => {
      notifyStoppedTyping(projectId, userId);
    }, 2000);
  };

  const handleDeleteMessage = async (messageId, senderId) => {
    // Only allow deletion if user is the sender or is staff
    if (senderId !== userId && userRole !== 'staff') {
      alert('You can only delete your own messages');
      return;
    }

    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await deleteProjectComment(messageId);
        if (response.success) {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        }
      } catch (err) {
        console.error('Error deleting message:', err);
        setError('Failed to delete message');
      }
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    if (userRole !== 'staff') {
      alert('Only staff can update message status');
      return;
    }

    try {
      const response = await updateCommentStatus(messageId, newStatus);
      if (response.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg
          )
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading messages...</div></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Project Discussion</h3>
        <p className={styles.subtitle}>Real-time feedback and updates</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Start a discussion!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`${styles.message} ${
                msg.senderModel === 'Client'
                  ? styles.clientMessage
                  : styles.staffMessage
              }`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>{msg.senderName}</span>
                <span
                  className={`${styles.badge} ${
                    msg.senderModel === 'Client'
                      ? styles.clientBadge
                      : styles.staffBadge
                  }`}
                >
                  {msg.senderModel}
                </span>
                {userRole === 'staff' && (
                  <select
                    className={styles.statusSelect}
                    value={msg.status || 'Open'}
                    onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Responded">Responded</option>
                    <option value="Closed">Closed</option>
                  </select>
                )}
                {msg.status && userRole !== 'staff' && (
                  <span className={`${styles.status} ${styles[`status${msg.status}`]}`}>
                    {msg.status}
                  </span>
                )}
              </div>

              <div className={styles.messageContent}>{msg.message}</div>

              <div className={styles.messageFooter}>
                <span className={styles.timestamp}>
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
                {msg.isEdited && <span className={styles.edited}>(edited)</span>}
                {(msg.sender === userId || userRole === 'staff') && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteMessage(msg._id, msg.sender)}
                    title="Delete message"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className={styles.typingIndicator}>
            <span>{typingUsers.join(', ')} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add feedback or correction..."
          className={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputValue.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ProjectDiscussion;
