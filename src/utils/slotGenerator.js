// Utility function to generate 30-minute slots
export function generateSlots(startTime, endTime) {
  const slots = [];
  const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const nextTime = new Date(currentTime.getTime() + interval);
    const formattedTime = `${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - ${nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    slots.push({
      time: formattedTime,
      status: "available",
      bookedBy: null,
    });
    currentTime = nextTime;
  }

  return slots;
}