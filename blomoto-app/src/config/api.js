const API_BASE_URL = "https://blomoto.pythonanywhere.com";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  SERVICES: `${API_BASE_URL}/service_app/services/`,
  GARAGES: `${API_BASE_URL}/garage_app/garages/`,
  USERS: `${API_BASE_URL}/user_app/users/`,
  LOGIN: `${API_BASE_URL}/user_app/login/`,
  REGISTER: `${API_BASE_URL}/user_app/register/`,
  LOGOUT: `${API_BASE_URL}/user_app/logout/`,
  TOKEN_REFRESH: `${API_BASE_URL}/user_app/token/refresh/`,
};
