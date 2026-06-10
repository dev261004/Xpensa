import { ApiError } from "../utils/ApiError.js";
import { getId } from "../utils/ids.js";

export const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
};

export const requireCompany = (req, _res, next) => {
  if (!getId(req.user?.companyId)) {
    return next(new ApiError(400, "User is not linked to a company"));
  }
  return next();
};
