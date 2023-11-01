import { useState, useEffect } from 'react';

function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format the time as 'hh:mm AM/PM'
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;

  const strTime = `${hours} : ${minutes} ${ampm} `;

  return strTime;
}

function CurrentDate() {
  const currentDate = new Date();

  // Format the date as 'dd-mm-yy'
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-based
  const year = currentDate.getFullYear().toString().substr(-2); // Get last two digits of year

  return `${day} / ${month} / ${year}`;
}

export { CurrentTime, CurrentDate };
