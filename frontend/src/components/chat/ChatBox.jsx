import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Image, Smile, Clock } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const ChatBox = ({ groupId }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;

    // Fetch initial message history
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/groups/${groupId}/messages`);
        if (isMounted) {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    const socket = getSocket();
    if (socket) {
      socket.emit('join_group', { groupId });

      socket.on('new_message', (msg) => {
        if (msg.groupId === groupId) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(scrollToBottom, 50);
        }
      });

      socket.on('user_typing', ({ groupId: gid, userName, isTyping }) => {
        if (gid === groupId) {
          setTypingUser(isTyping ? userName : null);
        }
      });

      return () => {
        socket.emit('leave_group', { groupId });
        socket.off('new_message');
        socket.off('user_typing');
      };
    }

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (socket) {
      socket.emit('typing_start', { groupId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { groupId });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    const socket = getSocket();
    if (socket) {
      socket.emit('typing_stop', { groupId });
      socket.emit('send_message', {
        groupId,
        content,
        messageType: 'TEXT',
      });
    } else {
      // Fallback HTTP
      try {
        const res = await api.post(`/groups/${groupId}/messages`, { content });
        setMessages((prev) => [...prev, res.data]);
        setTimeout(scrollToBottom, 50);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            Loading chat messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
            <p className="text-sm font-semibold text-slate-600 mb-1">
              Welcome to the community chat!
            </p>
            <p className="text-xs max-w-xs">
              Say hello, introduce yourself and start planning activities with fellow members.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?.id || msg.senderId === user?.id;
            return (
              <div
                key={msg._id || Math.random()}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {msg.senderId?.name ? msg.senderId.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMe
                      ? 'bg-primary-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs'
                  }`}
                >
                  {!isMe && (
                    <span className="block text-[11px] font-bold text-slate-500 mb-0.5">
                      {msg.senderId?.name || 'Member'}
                    </span>
                  )}
                  <p className="leading-relaxed break-words">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      isMe ? 'text-primary-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUser && (
        <div className="px-4 py-1 text-xs text-slate-400 italic bg-white border-t border-slate-50">
          {typingUser} is typing...
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message to the group..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md shadow-primary-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
