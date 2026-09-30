import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  chatDeleteApi,
  chatEditApi,
  createChatApi,
  getAllChatListApi,
  getChatMessagesApi,
  getSuggestionChatUsers,
  searchChatUsersApi,
  sendMessageApi,
} from '../../services/chatApi';

interface ChatState {
  messages: any[];
  chatUsers: any[];
  suggestionUsers: any[]; // ✅ ADD
  chatId: number | null;
  loading: boolean;
  error: string | null;
  page: any;
  hasMore: any;
  loadingMore: boolean;

}

const initialState: ChatState = {
  messages: [],
  chatId: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  chatUsers: [],
  suggestionUsers: [],
  loadingMore: false,
};

//
// 🔥 THUNKS
//

// ✅ Create chat
export const createChatThunk = createAsyncThunk(
  'chat/createChat',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await createChatApi(userId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// ✅ Get messages
export const getMessagesThunk = createAsyncThunk(
  'chat/getMessages',
  async (
    {
      chatId,
      page = 1,
    }: {
      chatId: string;
      page?: number;
    },
    { rejectWithValue },
  ) => {
    console.log('🔥 getMessagesThunk:', chatId);

    try {
      const res = await getChatMessagesApi(chatId, page);

      console.log('✅ Messages API Response:', res);

      return {
        data: res.data,
        page,
      };
    } catch (err: any) {
      console.log('❌ getMessagesThunk Error:', err);
      return rejectWithValue(err.response?.data);
    }
  },
);

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await sendMessageApi(payload);
      console.log('send message res', res);
      return res?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// Get All chat users list
export const getAllChatUsersThunk = createAsyncThunk(
  'chat/getAllChatUsers',
  async (
    {
      page = 1,
      limit = 20,
    }: {
      page?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllChatListApi(page, limit);

      const mapped = res.data.map((item: any) => ({
        id: item.chat_id,
        name: item.users?.is_deleted ? 'Deleted User' : item.users?.name,
        avatar:
          item.isBlocked || item.users?.is_deleted
            ? null
            : item.users?.profile_photo_path,
        isBlocked: item.isBlocked,
        isDeleted: item.users?.is_deleted ?? false, // ✅ was missing entirely — this was the bug
        message: item.last_message,
        time: item.last_message_at,
        unread: item.unread_count,
        online: item.users?.is_online,
        user_id: item.user_id,
        user_name: item.users?.user_name,
      }));

      return {
        chats: mapped,
        pagination: res.pagination,
        page,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// Get suggestion chat users
export const getSuggestionChatUsersThunk = createAsyncThunk(
  'chat/getSuggestionChatUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSuggestionChatUsers();

      // ✅ FIX HERE
      const users = res?.data || [];

      const mapped = users.map((item: any) => ({
        id: item.id,
        name: item.is_deleted ? 'Deleted User' : item.name,
        avatar: item.is_deleted ? null : item.profile_photo_path,
        isDeleted: item.is_deleted ?? false, // ✅ same fix applied here
        user_id: item.id,
        user_name: item.user_name,
      }));

      return mapped;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// ✅ Edit message
export const editMessageThunk = createAsyncThunk(
  'chat/editMessage',
  async (
    { message_id, message }: { message_id: number; message: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await chatEditApi(message_id, message);
      return { message_id, message, data: res };
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// ✅ Delete message
export const deleteMessageThunk = createAsyncThunk(
  'chat/deleteMessage',
  async (message_id: number, { rejectWithValue }) => {
    try {
      await chatDeleteApi(message_id);
      return message_id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const searchChatUsersThunk = createAsyncThunk(
  'chat/searchChatUsers',
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await searchChatUsersApi(query);

      // ✅ FIX HERE
      const users = res?.data || [];

      const mapped = users.map((item: any) => ({
        id: item.id,
        name: item.is_deleted ? 'Deleted User' : item.name,
        avatar: item.is_deleted ? null : item.profile_photo_path,
        isDeleted: item.is_deleted ?? false, // ✅ same fix applied here
        user_id: item.id,
        user_name: item.user_name,
      }));

      return mapped;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // ✅ Add message from socket
    addMessage: (state, action) => {
      const msg = action.payload;

      // ✅ replace optimistic
      if (msg.tempId) {
        const index = state.messages.findIndex(
          m => m.id === msg.tempId || m.tempId === msg.tempId,
        );

        if (index !== -1) {
          state.messages[index] = msg;
          return;
        }
      }

      // ✅ prevent duplicate
      const exists = state.messages.find(
        m =>
          String(m.id) === String(msg.id) ||
          (msg.tempId &&
            (String(m.tempId) === String(msg.tempId) ||
              String(m.id) === String(msg.tempId))),
      );
      if (exists) return;

      // 🔥 IMPORTANT FIX → add at TOP
      state.messages = [msg, ...state.messages];
    },

    markMessagesSeen: (state, action) => {
      const { chat_id, message_ids, message_id } = action.payload;

      // ✅ normalize → always array
      const ids = Array.isArray(message_ids)
        ? message_ids
        : message_id
          ? [message_id]
          : [];

      state.messages = state.messages.map((msg: any) => {
        if (String(msg.chat_id) !== String(chat_id)) return msg;

        if (ids.includes(msg.id)) {
          return {
            ...msg,
            is_read: true,
            status: 'seen',
            seen_at: action.payload.seen_at, // ✅ optional (nice to have)
            updatedAt: Date.now(), // force re-render
          };
        }

        return msg;
      });
    },

    // ✅ Clear chat when leaving
    clearChat: state => {
      state.messages = [];
      state.chatId = null;
    },

    updateChatListFromSocket: (state, action) => {
      const msg = action.payload;

      const index = state.chatUsers.findIndex(
        (c: any) =>
          String(c.id) === String(msg.chat_id) ||
          String(c.user_id) ===
          String(
            msg.sender_id === c.user_id ? msg.sender_id : msg.receiver_id,
          ),
      );

      if (index !== -1) {
        const chat = state.chatUsers[index];

        // ✅ update last message + unread
        const updatedChat = {
          ...chat,
          message: {
            id: msg.id,
            message: msg.message,
            file: msg.file || null,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            createdAt: msg.createdAt,
            is_read: msg.is_read || false,
          },
          time: msg.createdAt || new Date().toISOString(),
          unread:
            msg.sender_id === chat.user_id
              ? (chat.unread || 0) + 1
              : chat.unread,
        };

        // 🔥 move to top (WhatsApp behavior)
        state.chatUsers.splice(index, 1);
        state.chatUsers.unshift(updatedChat);
      }
    },

    editLocalMessage: (state, action) => {
      const { message_id, message } = action.payload;

      const index = state.messages.findIndex(
        (msg: any) => msg.id === message_id,
      );

      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          message,
          isEdited: true,
          updatedAt: Date.now(), // 🔥 force instant UI
        };
      }
    },

    deleteLocalMessage: (state, action) => {
      const id = action.payload;

      const index = state.messages.findIndex((m: any) => m.id === id);

      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        };
      }
    },
  },

  extraReducers: builder => {
    // 🔥 Create Chat
    builder.addCase(createChatThunk.fulfilled, (state, action) => {
      state.chatId = action.payload.chat_id;
    });

    // 🔥 Get Messages
    builder
      .addCase(getMessagesThunk.pending, state => {
        state.loading = true;
      })
      .addCase(getMessagesThunk.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.page === 1) {
          state.messages = [...action.payload.data];
        } else {
          state.messages = [...state.messages, ...action.payload.data];
        }

        // ✅ update page
        state.page = action.payload.page;

        // ✅ check hasMore
        if (action.payload.data.length === 0) {
          state.hasMore = false;
        }
      })
      .addCase(getMessagesThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // get all chat users

      .addCase(getAllChatUsersThunk.pending, (state, action) => {
        if (action.meta.arg?.page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })

      .addCase(getAllChatUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const { chats, pagination, page } = action.payload;

        if (page === 1) {
          // Initial load / Refresh
          state.chatUsers = chats;
        } else {
          // Pagination
          state.chatUsers = [...state.chatUsers, ...chats];
        }

        state.page = pagination.page;
        state.hasMore = pagination.page < pagination.total_pages;
      })

      .addCase(getAllChatUsersThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      .addCase(getSuggestionChatUsersThunk.pending, state => {
        state.loading = true;
      })
      .addCase(getSuggestionChatUsersThunk.fulfilled, (state, action) => {
        console.log('get all suggestions payload', action.payload);
        state.loading = false;
        state.suggestionUsers = action.payload; // ✅ store
      })
      .addCase(getSuggestionChatUsersThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✏️ EDIT MESSAGE
      .addCase(editMessageThunk.fulfilled, (state, action) => {
        const { message_id, message } = action.payload;

        const index = state.messages.findIndex(
          (msg: any) => msg.id === message_id,
        );

        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            message,
            isEdited: true,
            updatedAt: Date.now(), // force UI refresh
          };
        }
      })

      // ❌ DELETE MESSAGE
      .addCase(deleteMessageThunk.fulfilled, (state, action) => {
        const id = action.payload;

        const index = state.messages.findIndex((m: any) => m.id === id);

        if (index !== -1) {
          state.messages[index] = {
            ...state.messages[index],
            isDeleted: true,
            deletedAt: new Date().toISOString(),
          };
        }
      });
  },
});

export const {
  addMessage,
  clearChat,
  markMessagesSeen,
  updateChatListFromSocket,
  deleteLocalMessage,
  editLocalMessage,
} = chatSlice.actions;

export default chatSlice.reducer;