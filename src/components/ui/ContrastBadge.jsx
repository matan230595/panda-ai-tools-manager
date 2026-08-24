import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getContrastText } from '@/utils/contrast';

/**
 * Badge עם התאמה אוטומטית של צבע הטקסט לפי צבע הרקע.
 * מקבל bgColor בפורמט hex ומתאים טקסט כהה או בהיר לפי WCAG.
 */
export default function ContrastBadge({ bgColor, children, className = '', ...props }) {
  const textColor = getContrastText(bgColor);
  return (
    <Badge
      className={`${className}`}
      style={{ backgroundColor: bgColor, color: textColor, ...props.style }}
      {...props}
    >
      {children}
    </Badge>
  );
}