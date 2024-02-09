export const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + (hours * 60 * 60 * 1000));
}

export const getTimeUntil = (reference: Date, until: Date) => {
  const totalMs = until.getTime() - reference.getTime();

  if (totalMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  }

  const totalS = Math.floor(totalMs / 1000);
  
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = Math.round(totalS % 60);

  return {
    hours: h,
    minutes: m,
    seconds: s
  }
}