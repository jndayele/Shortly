export function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = crypto.randomUUID(); // Generate unique ID
    localStorage.setItem("userId", userId);
  }
  return userId;
}
