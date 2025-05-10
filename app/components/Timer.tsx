import React, { useEffect, useState } from "react";

const Timer = ({ endTime }: any) => {
  const calculateTimeLeft = () => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    return Math.max(Math.floor((end - now) / 1000), 0);
  };

  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <p className="mb-2 text-red-600">
      {timeLeft > 0 ? `Time left: ${formatTime(timeLeft)}` : "Time expired"}
    </p>
  );
};

export default Timer;
