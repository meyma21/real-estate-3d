import React from 'react';

type ApartmentStatus = 'AVAILABLE' | 'SOLD' | 'UNDER_CONSTRUCTION';

interface StatusBadgeProps {
  status: ApartmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClasses = 'badge ';
  let statusText = '';
  
  switch (status) {
    case 'AVAILABLE':
      badgeClasses += 'bg-green-100 text-green-800';
      statusText = 'Available';
      break;
    case 'SOLD':
      badgeClasses += 'bg-red-100 text-red-800';
      statusText = 'Sold';
      break;
    case 'UNDER_CONSTRUCTION':
      badgeClasses += 'bg-amber-100 text-amber-800';
      statusText = 'Under Construction';
      break;
    default:
      badgeClasses += 'bg-slate-100 text-slate-800';
      statusText = 'Unknown';
  }
  
  return (
    <span className={badgeClasses}>
      {statusText}
    </span>
  );
};

export default StatusBadge;