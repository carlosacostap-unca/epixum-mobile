"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  showTime?: boolean;
}

export default function FormattedDate({ date, options, className = "", showTime = false }: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (!date) return;

    const dateObj = new Date(date);
    
    // Default options if none provided
    const defaultOptions: Intl.DateTimeFormatOptions = showTime 
      ? { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric',
          second: undefined 
        }
      : { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric' 
        };

    const finalOptions = options || defaultOptions;
    
    // Use the browser's locale and timezone
    setFormattedDate(dateObj.toLocaleString(undefined, finalOptions));
  }, [date, options, showTime]);

  // Render a placeholder or nothing to avoid hydration mismatch
  if (!formattedDate) {
    return <span className={`opacity-0 ${className}`}>...</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
