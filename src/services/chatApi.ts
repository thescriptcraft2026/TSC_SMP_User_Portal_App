import api from '../../Instance/Instance';

// ✅ Create chat
export const createChatApi = async (userId: number) => {
  const res = await api.post('/chat', {
    receiver_id: userId,
  });
  return res.data;
};

// ✅ Get messages by chat_id
export const getChatMessagesApi = async (chatId: string, page = 1) => {
  console.log('➡️ Loading messages for:', chatId);

  const res = await api.get(`/chat/${chatId}/messages`, {
    params: { page },
  });

  console.log('✅ Messages API Response:', res.data);

  return res.data;
};

export const sendMessageApi = async (payload: {
  receiver_id: number;
  message?: string;
  file?: any;
}) => {
  const res = await api.post('/chat', payload);
  return res.data;
};

export const getAllChatListApi = async (
  page = 1,
  limit = 20,
  search = '',
) => {
  const res = await api.get('/chat/users', {
    params: {
      page,
      limit,
      search,
    },
  });

  return res.data;
};

export const getSuggestionChatUsers = async () => {
  const res = await api.get('/chat/suggestion/users');
  return res?.data;
};

export const chatEditApi = async (message_id: any, message: any) => {
  const res = await api.put('/chat/edit', { message_id, message });
  return res.data;
};

export const chatDeleteApi = async (message_id: any) => {
  const res = await api.delete('/chat/delete', {
    data: { message_id },
  });
  return res.data;
};

export const searchChatUsersApi = async (
  query: string,
  page = 1,
  limit = 20,
) => {
  const res = await api.get('/chat/users', {
    params: {
      search: query,
      page,
      limit,
    },
  });

  return res.data;
};