export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const setAuth = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem("token", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const routeForRole = (role) => {
  if (role === "Admin") return "/admin/dashboard";
  if (role === "Manager") return "/manager/dashboard";
  if (role === "Employee") return "/employee/dashboard";
  return "/admin/login";
};
