export const getId = (value) => value?._id?.toString?.() || value?.toString?.() || "";

export const sameId = (left, right) => getId(left) === getId(right);
