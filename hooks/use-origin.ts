// This hook is used to get the origin of the current window. 
export const useOrigin = () => {
  return typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "";
};
