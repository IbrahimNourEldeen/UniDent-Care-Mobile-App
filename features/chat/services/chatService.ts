import api from "@/utils/api";

export const getConversations = async () => {
  const response = await api.get("/Chat/conversations");
  return response.data;
};

export const getConversationDetails = async (conversationId: string) => {
  const response = await api.get(`/Chat/conversation/${conversationId}`);
  return response.data;
};
