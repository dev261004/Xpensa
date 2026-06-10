import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCountries } from "../services/countries.service.js";

export const getCountriesMeta = asyncHandler(async (_req, res) => {
  const countries = await getCountries();
  return res.status(200).json(new ApiResponse(200, countries, "Countries fetched successfully"));
});
