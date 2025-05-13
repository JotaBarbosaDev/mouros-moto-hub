
import React from 'react';
import EventCard from './EventCard';

interface EventCardWrapperProps {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  type: 'trail' | 'encontro' | 'estrada';
  description: string;
}

const EventCardWrapper: React.FC<EventCardWrapperProps> = (props) => {
  // Process the image URL to ensure it works
  const processedImage = props.image.startsWith('http') 
    ? props.image 
    : `/placeholders/default-event.jpg`;
  
  return (
    <EventCard
      {...props}
      image={processedImage}
    />
  );
};

export default EventCardWrapper;
