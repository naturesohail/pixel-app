import React, { useEffect, useState } from "react";
import moment from "moment"
const Timer = ({ endTime }: any) => {
  const calculateTimeLeft = () => {
   return moment(endTime).fromNow()
  };






  return (
    <p className="mb-2 text-red-600">
      {calculateTimeLeft()}
    </p>
  );
};

export default Timer;
