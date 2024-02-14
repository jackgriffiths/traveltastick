export const addHours = (date: Date, hours: number) => {
  return addMinutes(date, hours * 60);
}

export const addMinutes = (date: Date, minutes: number) => {
  return addSeconds(date, minutes * 60);
}

export const addSeconds = (date: Date, seconds: number) => {
  return addMilliseconds(date, seconds * 1000);
}

export const addMilliseconds = (date: Date, milliseconds: number) => {
  return new Date(date.getTime() + milliseconds);
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