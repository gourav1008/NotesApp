import React, { useState, useEffect } from 'react';
import { LoaderIcon, SendIcon, Search, RefreshCcw } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const MessagingInterface = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await api.get(`/admin/messages/${userId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to fetch messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newMessage.trim()) return;

        try {
            await api.post(`/admin/messages`, {
                userId: selectedUser._id,
                content: newMessage.trim()
            });
            toast.success('Message sent successfully');
            setNewMessage('');
            fetchMessages(selectedUser._id);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-16rem)]">
            {/* Users List */}
            <div className="col-span-4 card bg-base-200">
                <div className="card-body">
                    <div className="form-control mb-4">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="input input-bordered w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-square">
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto">
                        {filteredUsers.map(user => (
                            <button
                                key={user._id}
                                className={`btn btn-ghost w-full justify-start mb-2 ${selectedUser?._id === user._id ? 'btn-active' : ''
                                    }`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-semibold">{user.name}</span>
                                    <span className="text-sm opacity-70">{user.email}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="col-span-8 card bg-base-200">
                <div className="card-body flex flex-col h-full">
                    {selectedUser ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">
                                    Messages with {selectedUser.name}
                                </h3>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => fetchMessages(selectedUser._id)}
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto mb-4 space-y-2">
                                {messages.map(message => (
                                    <div
                                        key={message._id}
                                        className="chat chat-end"
                                    >
                                        <div className="chat-bubble">
                                            {message.content}
                                            <div className="text-xs opacity-70 mt-1">
                                                {new Date(message.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered flex-grow"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                />
                                <button type="submit" className="btn btn-primary">
                                    <SendIcon className="h-5 w-5" />
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a user to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagingInterface;