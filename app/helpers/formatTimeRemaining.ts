export const formatTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Ended";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) return `${diffDays}d Left`;
  if (diffHours > 0) return `${diffHours}h ${diffMinutes}m Left` ;
  return `${diffMinutes}m Left`;
};
