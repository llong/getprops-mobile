export const generateUsername = (email: string): string => {
  const baseUsername =
    email
      .split("@")[0]
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "user";
  return baseUsername + Math.random().toString(36).substring(2, 5);
};
