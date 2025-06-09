type getType = 'full' | 'time' | 'elapsed';

export function getDateTime(type: getType, date: Date) {
  const formattedTime = date.toLocaleString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  switch (type) {
    case 'full': {
      const formattedDate = date
        .toLocaleString('ko-KR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })
        .replaceAll(' ', '')
        .replace(/\.$/, '');

      return formattedDate + ' ' + formattedTime;
    }
    case 'time': {
      return formattedTime;
    }
    case 'elapsed': {
      const startDate = new Date(Date.now());
      const targetDate = date;

      const timeElapsed = startDate.getTime() - targetDate.getTime();
      const seconds = Math.floor(timeElapsed / 1000);
      const minutes = Math.floor(timeElapsed / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const isOverSeconds = seconds > 0 && seconds < 60;
      if (isOverSeconds) {
        return `${seconds}초`;
      }

      const isOverMinutes = minutes > 0 && minutes < 60;
      if (isOverMinutes) {
        return `${minutes}분`;
      }

      const isOverHours = hours > 0 && hours < 24;
      if (isOverHours) {
        return `${hours}시간`;
      }

      const isOverDays = days > 0 && days < 31;
      if (isOverDays) {
        return `${days}일`;
      }

      const isOverMonths = days > 30 && days < 365;
      if (isOverMonths) {
        const months = startDate.getMonth() - targetDate.getMonth();
        return `${months}개월`;
      }

      const isOverYears = days > 364;
      if (isOverYears) {
        const years = startDate.getFullYear() - targetDate.getFullYear();
        return `${years}년`;
      }

      return `0초`;
    }
    default: {
      console.error(
        `getDateTime function error: Unexpected type or props, (${type}, ${date}) received`
      );
      return 'Error';
    }
  }
}
