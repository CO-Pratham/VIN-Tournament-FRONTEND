import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/posts/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/community/posts/', postData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const likePost = createAsyncThunk(
  'community/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like/`)
      return { postId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchComments = createAsyncThunk(
  'community/fetchComments',
  async ({ contentType, objectId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/comments/', {
        params: { content_type: contentType, object_id: objectId }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createComment = createAsyncThunk(
  'community/createComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/community/comments/', commentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchChatRooms = createAsyncThunk(
  'community/fetchChatRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getChatRooms()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chat rooms')
    }
  }
)

export const joinChatRoom = createAsyncThunk(
  'community/joinChatRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await api.joinChatRoom(roomId)
      return { roomId, ...response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to join chat room')
    }
  }
)

export const fetchChatMessages = createAsyncThunk(
  'community/fetchChatMessages',
  async ({ roomId, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await api.getChatMessages(roomId)
      return { roomId, messages: response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chat messages')
    }
  }
)

export const sendChatMessage = createAsyncThunk(
  'community/sendChatMessage',
  async ({ roomId, content }, { rejectWithValue }) => {
    try {
      const response = await api.sendChatMessage(roomId, {
        content,
        message_type: 'text'
      })
      return { roomId, message: response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send chat message')
    }
  }
)

export const fetchFeed = createAsyncThunk(
  'community/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getFeed()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch feed')
    }
  }
)

export const followUser = createAsyncThunk(
  'community/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.followUser(userId)
      return { userId, ...response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to follow user')
    }
  }
)

const initialState = {
  posts: [],
  comments: [],
  chatRooms: [],
  chatMessages: {},
  feed: [],
  selectedChatRoom: null,
  loading: false,
  error: null,
  postsLoading: false,
  commentsLoading: false,
  chatLoading: false,
}

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedChatRoom: (state, action) => {
      state.selectedChatRoom = action.payload
    },
    addChatMessage: (state, action) => {
      const { roomId, message } = action.payload
      if (!state.chatMessages[roomId]) {
        state.chatMessages[roomId] = []
      }
      state.chatMessages[roomId].push(message)
    },
    updatePostLikes: (state, action) => {
      const { postId, liked, likesCount } = action.payload
      const post = state.posts.find(p => p.id === postId)
      if (post) {
        post.is_liked = liked
        post.likes_count = likesCount
      }
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload)
    },
    addComment: (state, action) => {
      state.comments.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.postsLoading = true
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.postsLoading = false
        state.posts = action.payload.results || action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.postsLoading = false
        state.error = action.payload
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload)
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, likes_count } = action.payload
        const post = state.posts.find(p => p.id === postId)
        if (post) {
          post.is_liked = liked
          post.likes_count = likes_count
        }
      })
      // Fetch Comments
      .addCase(fetchComments.pending, (state) => {
        state.commentsLoading = true
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsLoading = false
        state.comments = action.payload.results || action.payload
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.commentsLoading = false
        state.error = action.payload
      })
      // Create Comment
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.push(action.payload)
      })
      // Fetch Chat Rooms
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.chatRooms = action.payload.results || action.payload
      })
      // Join Chat Room
      .addCase(joinChatRoom.fulfilled, (state, action) => {
        const { roomId } = action.payload
        const room = state.chatRooms.find(r => r.id === roomId)
        if (room) {
          room.is_participant = true
        }
      })
      // Fetch Chat Messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.chatLoading = true
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.chatLoading = false
        const { roomId, messages } = action.payload
        state.chatMessages[roomId] = messages.results || messages
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.chatLoading = false
        state.error = action.payload
      })
      // Send Chat Message
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const { roomId, message } = action.payload
        if (!state.chatMessages[roomId]) {
          state.chatMessages[roomId] = []
        }
        state.chatMessages[roomId].push(message)
      })
      // Fetch Feed
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.feed = action.payload.results || action.payload
      })
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        // Update follow status in relevant places
      })
  },
})

export const {
  clearError,
  setSelectedChatRoom,
  addChatMessage,
  updatePostLikes,
  addPost,
  addComment,
} = communitySlice.actions

export default communitySlice.reducer
