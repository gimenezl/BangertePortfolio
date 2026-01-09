'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, Check, Clock, User, RefreshCw } from 'lucide-react';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    created_at: string;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/messages');
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await fetch(`/api/admin/messages?id=${id}`, {
                method: 'PATCH',
            });
            setMessages(messages.map(m =>
                m.id === id ? { ...m, read: true } : m
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE',
            });
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const unreadCount = messages.filter(m => !m.read).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold">Messages</h1>
                    <p className="text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
                    </p>
                </div>
                <button
                    onClick={fetchMessages}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-1">Messages from your contact form will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages list */}
                    <div className="space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => {
                                    setSelectedMessage(message);
                                    if (!message.read) {
                                        handleMarkAsRead(message.id);
                                    }
                                }}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${selectedMessage?.id === message.id
                                        ? 'bg-black text-white'
                                        : message.read
                                            ? 'bg-gray-50 hover:bg-gray-100'
                                            : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className={selectedMessage?.id === message.id ? 'text-white/70' : 'text-gray-400'} />
                                        <span className="font-medium">{message.name}</span>
                                    </div>
                                    {!message.read && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                                <p className={`text-sm ${selectedMessage?.id === message.id ? 'text-white/70' : 'text-gray-500'}`}>
                                    {message.email}
                                </p>
                                <p className={`text-sm mt-2 line-clamp-2 ${selectedMessage?.id === message.id ? 'text-white/80' : 'text-gray-600'}`}>
                                    {message.message}
                                </p>
                                <div className={`flex items-center gap-1 mt-3 text-xs ${selectedMessage?.id === message.id ? 'text-white/50' : 'text-gray-400'}`}>
                                    <Clock size={12} />
                                    {formatDate(message.created_at)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message detail */}
                    <div className="lg:sticky lg:top-4">
                        {selectedMessage ? (
                            <div className="bg-white border rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold">{selectedMessage.name}</h2>
                                        <a
                                            href={`mailto:${selectedMessage.email}`}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete message"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                    <Clock size={14} />
                                    {formatDate(selectedMessage.created_at)}
                                    {selectedMessage.read && (
                                        <span className="flex items-center gap-1 text-green-500 ml-2">
                                            <Check size={14} />
                                            Read
                                        </span>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: Your inquiry`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Mail size={18} />
                                        Reply via Email
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <Mail size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Select a message to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
