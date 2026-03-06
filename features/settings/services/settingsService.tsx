import api from "@/utils/api";

export const changePassword = (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  return api.post("/Auth/change-password", payload);
};

export const deleteAccount = (role: string, id: string) => {
  return api.delete(`/${role}/${id}`);
};
