import { useState, useEffect } from 'react';

export const useRealTimeDate = (updateInterval: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return currentTime;
};

export const getDueDateStatus = (dueDate: Date | string, currentTime: Date = new Date()) => {
  const now = currentTime;
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    // Overdue
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 0 ? 'Overdue today' : `${overdueDays}d overdue`,
      color: 'text-red-600 bg-red-50 border-red-200',
      status: 'overdue' as const,
      urgency: 'high' as const
    };
  } else if (diffDays === 0) {
    // Due today
    if (diffHours <= 2) {
      return {
        text: 'Due soon',
        color: 'text-red-600 bg-red-50 border-red-200',
        status: 'due-soon' as const,
        urgency: 'high' as const
      };
    }
    return {
      text: 'Due today',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      status: 'due-today' as const,
      urgency: 'medium' as const
    };
  } else if (diffDays === 1) {
    return {
      text: 'Due tomorrow',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      status: 'due-tomorrow' as const,
      urgency: 'medium' as const
    };
  } else if (diffDays <= 7) {
    return {
      text: `${diffDays} days left`,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      status: 'due-this-week' as const,
      urgency: 'low' as const
    };
  } else {
    return {
      text: due.toLocaleDateString(),
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      status: 'future' as const,
      urgency: 'low' as const
    };
  }
};
