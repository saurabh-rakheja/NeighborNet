import React, { useState, useEffect } from "react";
import {
  FiMessageSquare,
  FiUser,
  FiSend,
  FiChevronRight,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiPaperclip,
  FiSmile,
  FiClock,
} from "react-icons/fi";

const NGOMessages = () => {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // For now, simulate API response
        setTimeout(() => {
          const mockConversations = [
            {
              id: 1,
              userId: 101,
              userName: "Jessica Thompson",
              userAvatar: null,
              lastMessage: "I'm looking forward to volunteering at the event!",
              lastMessageTime: "2023-06-02T15:30:00",
              unread: 2,
              userType: "volunteer",
            },
            {
              id: 2,
              userId: 102,
              userName: "Marcus Williams",
              userAvatar: null,
              lastMessage: "Thank you for approving my application.",
              lastMessageTime: "2023-06-01T10:15:00",
              unread: 0,
              userType: "volunteer",
            },
            {
              id: 3,
              userId: 103,
              userName: "Habitat for Humanity",
              userAvatar: null,
              lastMessage:
                "Would you like to collaborate on the upcoming initiative?",
              lastMessageTime: "2023-05-30T14:20:00",
              unread: 1,
              userType: "organization",
            },
            {
              id: 4,
              userId: 104,
              userName: "Sophia Lee",
              userAvatar: null,
              lastMessage: "What skills are needed for the tutoring program?",
              lastMessageTime: "2023-05-29T09:45:00",
              unread: 0,
              userType: "volunteer",
            },
            {
              id: 5,
              userId: 105,
              userName: "Local Food Bank",
              userAvatar: null,
              lastMessage: "We can provide resources for your food drive.",
              lastMessageTime: "2023-05-28T16:10:00",
              unread: 0,
              userType: "organization",
            },
          ];

          // Filter based on search term
          let filteredConversations = mockConversations;
          if (search) {
            const searchLower = search.toLowerCase();
            filteredConversations = mockConversations.filter(
              (conversation) =>
                conversation.userName.toLowerCase().includes(searchLower) ||
                conversation.lastMessage.toLowerCase().includes(searchLower)
            );
          }

          setConversations(filteredConversations);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations. Please try again later.");
        setLoading(false);
      }
    };

    fetchConversations();
  }, [search]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, this would be an API call
        // For now, simulate API response
        setTimeout(() => {
          const userId = activeConversation.userId;
          const mockMessages = [
            {
              id: 1,
              senderId: userId,
              senderName: activeConversation.userName,
              content: "Hello, I'm interested in your upcoming event.",
              timestamp: "2023-06-01T09:30:00",
              read: true,
            },
            {
              id: 2,
              senderId: "ngo",
              senderName: "Your Organization",
              content:
                "Hi there! Thanks for your interest. What would you like to know about it?",
              timestamp: "2023-06-01T09:35:00",
              read: true,
            },
            {
              id: 3,
              senderId: userId,
              senderName: activeConversation.userName,
              content:
                "I was wondering what skills are required for volunteers?",
              timestamp: "2023-06-01T09:40:00",
              read: true,
            },
            {
              id: 4,
              senderId: "ngo",
              senderName: "Your Organization",
              content:
                "For this event, we're looking for volunteers with basic organizational skills and a willingness to help. No specific expertise is required!",
              timestamp: "2023-06-01T09:45:00",
              read: true,
            },
            {
              id: 5,
              senderId: userId,
              senderName: activeConversation.userName,
              content: "That sounds perfect! I've submitted my application.",
              timestamp: "2023-06-01T10:00:00",
              read: true,
            },
            {
              id: 6,
              senderId: "ngo",
              senderName: "Your Organization",
              content: "Great! We'll review it soon and get back to you.",
              timestamp: "2023-06-01T10:05:00",
              read: true,
            },
            {
              id: 7,
              senderId: userId,
              senderName: activeConversation.userName,
              content: activeConversation.lastMessage,
              timestamp: activeConversation.lastMessageTime,
              read: activeConversation.unread === 0,
            },
          ];

          setMessages(mockMessages);
          setLoading(false);

          // Mark conversation as read
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === activeConversation.id ? { ...conv, unread: 0 } : conv
            )
          );
        }, 800);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again later.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Handle sending new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    // In a real app, this would be an API call
    // For now, simulate API response
    const newMsg = {
      id: messages.length + 1,
      senderId: "ngo",
      senderName: "Your Organization",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Update last message in conversation list
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              lastMessage: newMessage,
              lastMessageTime: new Date().toISOString(),
              unread: 0,
            }
          : conv
      )
    );
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Messages</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Conversations List */}
          <div className="border-r border-gray-200 md:col-span-1">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                {search && (
                  <button
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => setSearch("")}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            {loading && !activeConversation ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error && !activeConversation ? (
              <div className="p-4 text-center text-red-500">
                <FiAlertCircle className="inline-block mr-1" />
                {error}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FiMessageCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="mb-1">No conversations found</p>
                <p className="text-sm">
                  {search
                    ? "Try a different search term"
                    : "Start a new conversation with a volunteer"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      activeConversation?.id === conversation.id
                        ? "bg-indigo-50"
                        : ""
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                          conversation.userType === "organization"
                            ? "bg-blue-500"
                            : "bg-indigo-500"
                        } text-white`}
                      >
                        {getInitials(conversation.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 truncate">
                            {conversation.userName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Thread */}
          <div className="md:col-span-2 flex flex-col h-[600px]">
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <FiMessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Your Messages
                </h3>
                <p className="max-w-md text-sm">
                  Select a conversation to view messages or start a new
                  conversation with a volunteer.
                </p>
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                        activeConversation.userType === "organization"
                          ? "bg-blue-500"
                          : "bg-indigo-500"
                      } text-white`}
                    >
                      {getInitials(activeConversation.userName)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {activeConversation.userName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {activeConversation.userType === "organization"
                          ? "Organization"
                          : "Volunteer"}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <FiInfo className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      <FiAlertCircle className="inline-block mr-1" />
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === "ngo"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                              message.senderId === "ngo"
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-700 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === "ngo"
                                  ? "text-indigo-200"
                                  : "text-gray-500"
                              } flex items-center`}
                            >
                              <FiClock className="mr-1 h-3 w-3" />
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <FiPaperclip className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <FiSmile className="h-5 w-5" />
                      </button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg mx-2 py-2 px-3"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
                        disabled={!newMessage.trim()}
                      >
                        <FiSend className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOMessages;
