import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Users,
  Hash,
  Send,
  Heart,
  MessageSquare,
  Share,
  Pin,
  Plus,
  Search,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useDispatch } from "react-redux";
import { fetchNotifications } from "../store/slices/notificationSlice";
import ChatWebSocketService from "../services/chatWebSocket";

export default function Community() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Channel management state
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    type: "public",
    max_members: 100,
  });
  const [myChannels, setMyChannels] = useState([]);
  const [channelMembers, setChannelMembers] = useState([]);
  const [showChannelMembers, setShowChannelMembers] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [chatConnected, setChatConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCommunityData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError("Please log in to view community data");
    }
  }, [isAuthenticated, authLoading]);

  // WebSocket connection for live chat
  useEffect(() => {
    if (selectedRoom && isAuthenticated) {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Connect to chat WebSocket
        ChatWebSocketService.connect(selectedRoom, token);

        // Listen for messages
        const unsubscribeMessages = ChatWebSocketService.onMessage(
          (message) => {
            if (message.history) {
              // Message history received
              setChatMessages(message.history);
            } else {
              // New message received
              setChatMessages((prev) => [...prev, message]);
            }
          }
        );

        // Listen for connection changes
        const unsubscribeConnection = ChatWebSocketService.onConnectionChange(
          (connected) => {
            setChatConnected(connected);
          }
        );

        return () => {
          unsubscribeMessages();
          unsubscribeConnection();
          ChatWebSocketService.disconnect();
        };
      }
    }
  }, [selectedRoom, isAuthenticated]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [postsRes, chatRoomsRes, myChannelsRes] = await Promise.all([
        api.getFeed(),
        api.getChatRooms(),
        api.getMyChannels(),
      ]);

      setPosts(postsRes.data?.posts || postsRes.results || postsRes || []);
      setChatRooms(
        chatRoomsRes.data?.rooms || chatRoomsRes.results || chatRoomsRes || []
      );
      setMyChannels(
        myChannelsRes.data?.channels ||
          myChannelsRes.results ||
          myChannelsRes ||
          []
      );
    } catch (error) {
      console.error("Error fetching community data:", error);
      setError("Failed to load community data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const postData = {
        content: newPost,
        post_type: "general",
      };

      const newPostResponse = await api.createPost(postData);
      setPosts([newPostResponse, ...posts]);
      setNewPost("");
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.likePost(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleJoinChatRoom = async (roomId) => {
    try {
      // Check if user is already a member
      const room = chatRooms.find((r) => r.id === roomId);
      if (room && room.is_member) {
        // User is already a member, just select the room
        setSelectedRoom(roomId);
        const messagesRes = await api.getChatMessages(roomId);
        setChatMessages(messagesRes.results || messagesRes);
        return;
      }

      // User is not a member, try to join
      await api.joinChatRoom(roomId);
      setSelectedRoom(roomId);
      const messagesRes = await api.getChatMessages(roomId);
      setChatMessages(messagesRes.results || messagesRes);

      // Refresh data to update membership status
      await fetchCommunityData();
    } catch (error) {
      console.error("Error joining chat room:", error);
      if (error.message.includes("already a member")) {
        // User is already a member, just select the room
        setSelectedRoom(roomId);
        const messagesRes = await api.getChatMessages(roomId);
        setChatMessages(messagesRes.results || messagesRes);
      } else {
        setError("Failed to join chat room");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    // Try WebSocket first for real-time
    const sent = ChatWebSocketService.sendMessage(newMessage);

    if (!sent) {
      // Fallback to HTTP if WebSocket not connected
      try {
        const messageData = {
          content: newMessage,
          message_type: "text",
        };

        const newMessageResponse = await api.sendChatMessage(
          selectedRoom,
          messageData
        );
        // Add the new message to the list with proper structure
        const formattedMessage = {
          ...newMessageResponse,
          sender: newMessageResponse.sender || { username: "You" },
          content: newMessageResponse.content || newMessage,
        };
        setChatMessages([...chatMessages, formattedMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
        return;
      }
    }

    setNewMessage("");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Channel Management Functions
  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) return;

    try {
      const response = await api.createChannel(newChannel);
      setNewChannel({
        name: "",
        description: "",
        type: "public",
        max_members: 100,
      });
      setShowCreateChannel(false);
      await fetchCommunityData(); // Refresh data
      
      // Fetch notifications to show the channel creation notification
      dispatch(fetchNotifications());
    } catch (error) {
      console.error("Error creating channel:", error);
      setError("Failed to create channel");
    }
  };

  const handleJoinChannel = async (roomId, isPrivate = false) => {
    try {
      if (isPrivate && inviteCode) {
        await api.joinChannel(roomId, inviteCode);
      } else {
        await api.joinChannel(roomId);
      }
      setInviteCode("");
      await fetchCommunityData(); // Refresh data
      
      // Fetch notifications to show the join notification
      dispatch(fetchNotifications());
    } catch (error) {
      console.error("Error joining channel:", error);
      setError("Failed to join channel");
    }
  };

  const handleLeaveChannel = async (roomId) => {
    try {
      await api.leaveChannel(roomId);
      await fetchCommunityData(); // Refresh data
    } catch (error) {
      console.error("Error leaving channel:", error);
      setError("Failed to leave channel");
    }
  };

  const handleManageChannelMember = async (roomId, userId, action) => {
    try {
      await api.manageChannelMember(roomId, userId, action);
      await fetchChannelMembers(roomId); // Refresh members
    } catch (error) {
      console.error("Error managing channel member:", error);
      setError("Failed to manage channel member");
    }
  };

  const fetchChannelMembers = async (roomId) => {
    try {
      const response = await api.getChannelMembers(roomId);
      setChannelMembers(
        response.data?.members || response.results || response || []
      );
    } catch (error) {
      console.error("Error fetching channel members:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            💬 Community Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Connect, share, and grow with fellow gamers!
          </p>
        </motion.div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-blue-400">5.2K</span>
            </div>
            <h3 className="text-lg font-semibold">Total Members</h3>
            <p className="text-sm text-gray-400">Active community</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="text-green-400" size={24} />
              <span className="text-2xl font-bold text-green-400">1.8K</span>
            </div>
            <h3 className="text-lg font-semibold">Daily Messages</h3>
            <p className="text-sm text-gray-400">Very active today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Hash className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-purple-400">12</span>
            </div>
            <h3 className="text-lg font-semibold">Channels</h3>
            <p className="text-sm text-gray-400">Different topics</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="text-yellow-400" size={24} />
              <span className="text-2xl font-bold text-yellow-400">342</span>
            </div>
            <h3 className="text-lg font-semibold">Online Now</h3>
            <p className="text-sm text-gray-400">Ready to chat</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
          {[
            { id: "feed", label: "Community Feed", icon: MessageCircle },
            { id: "channels", label: "Channels", icon: Hash },
            { id: "chat", label: "Live Chat", icon: Send },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "feed" && (
            <div className="space-y-6">
              {/* Create Post */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Share with the community
                </h3>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    🎮
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's on your mind? Share your gaming experiences..."
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                      rows="3"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm text-gray-400">
                        {newPost.length}/280 characters
                      </div>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              {authLoading || loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-4">
                    {authLoading
                      ? "Checking authentication..."
                      : "Loading community feed..."}
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={fetchCommunityData}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle
                    className="mx-auto text-gray-400 mb-4"
                    size={48}
                  />
                  <p className="text-gray-400">
                    No posts yet. Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {post.author?.username?.charAt(0).toUpperCase() || "🎮"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {post.author?.username || "Anonymous"}
                          </h4>
                          <span className="text-sm text-gray-400">
                            {formatTimestamp(post.created_at)}
                          </span>
                          {post.is_pinned && (
                            <Pin className="text-yellow-400" size={16} />
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        <div className="flex items-center gap-6 text-gray-400">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-2 hover:text-red-400 transition-colors"
                          >
                            <Heart size={18} />
                            {post.likes_count || 0}
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                            <MessageSquare size={18} />
                            {post.comments_count || 0}
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                            <Share size={18} />
                            {post.shares_count || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "channels" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Chat Channels</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                  <Plus size={16} />
                  Create Channel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {authLoading || loading ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">
                      {authLoading
                        ? "Checking authentication..."
                        : "Loading channels..."}
                    </p>
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <Hash className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-400">
                      No channels available. Create the first one!
                    </p>
                  </div>
                ) : (
                  chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Hash className="text-blue-400" size={20} />
                        <h3 className="text-xl font-semibold">{room.name}</h3>
                        {room.room_type === "tournament" && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            Tournament
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-4">
                        {room.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-400">
                          {room.participants_count || 0} members
                        </div>
                        <div className="text-sm text-green-400">
                          {room.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinChatRoom(room.id)}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        Join Channel
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "channels" && (
            <div className="space-y-6">
              {/* Create Channel */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Create New Channel</h3>
                  <button
                    onClick={() => setShowCreateChannel(!showCreateChannel)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {showCreateChannel ? "Cancel" : "Create Channel"}
                  </button>
                </div>

                {showCreateChannel && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Channel Name
                      </label>
                      <input
                        type="text"
                        value={newChannel.name}
                        onChange={(e) =>
                          setNewChannel({ ...newChannel, name: e.target.value })
                        }
                        placeholder="Enter channel name"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={newChannel.description}
                        onChange={(e) =>
                          setNewChannel({
                            ...newChannel,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter channel description"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                        rows="2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Channel Type
                        </label>
                        <select
                          value={newChannel.type}
                          onChange={(e) =>
                            setNewChannel({
                              ...newChannel,
                              type: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Max Members
                        </label>
                        <input
                          type="number"
                          value={newChannel.max_members}
                          onChange={(e) =>
                            setNewChannel({
                              ...newChannel,
                              max_members: parseInt(e.target.value),
                            })
                          }
                          min="2"
                          max="1000"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateChannel}
                      disabled={!newChannel.name.trim()}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg transition-colors"
                    >
                      Create Channel
                    </button>
                  </div>
                )}
              </div>

              {/* My Channels */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">My Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myChannels.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <Hash className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-400">
                        You haven't joined any channels yet
                      </p>
                    </div>
                  ) : (
                    myChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Hash className="text-blue-400" size={20} />
                            <h4 className="font-semibold">{channel.name}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                channel.type === "public"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {channel.type}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => fetchChannelMembers(channel.id)}
                              className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                            >
                              Members
                            </button>
                            <button
                              onClick={() => handleLeaveChannel(channel.id)}
                              className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 rounded"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {channel.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{channel.member_count || 0} members</span>
                          <span>{channel.user_role}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Available Channels */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Available Channels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chatRooms.length === 0 ? (
                    <div className="col-span-2 text-center py-8">
                      <Hash className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-400">No channels available</p>
                    </div>
                  ) : (
                    chatRooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Hash className="text-blue-400" size={20} />
                            <h4 className="font-semibold">{room.name}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                room.type === "public"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {room.type}
                            </span>
                          </div>
                          {!room.is_member && (
                            <button
                              onClick={() =>
                                handleJoinChannel(
                                  room.id,
                                  room.type === "private"
                                )
                              }
                              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded"
                            >
                              Join
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {room.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{room.member_count || 0} members</span>
                          <span>Created by {room.created_by?.username}</span>
                        </div>
                        {room.type === "private" && !room.is_member && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                              placeholder="Enter invite code"
                              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white placeholder-gray-400 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              {selectedRoom ? (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <Hash className="text-green-400" size={20} />
                    <h3 className="text-xl font-semibold">
                      {chatRooms.find((room) => room.id === selectedRoom)
                        ?.name || "Chat Room"}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {chatRooms.find((room) => room.id === selectedRoom)
                        ?.member_count || 0}{" "}
                      members
                    </span>
                    {chatConnected && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <MessageCircle className="mx-auto mb-4" size={48} />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-blue-400">
                              {msg.sender?.username || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(msg.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-300">
                            {msg.content || msg.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Hash className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-400 mb-4">
                    Select a channel to start chatting
                  </p>
                  <button
                    onClick={() => setActiveTab("channels")}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    Browse Channels
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
