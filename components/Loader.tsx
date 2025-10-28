import React from 'react';

interface LoaderProps {
  text: string;
}

export const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className='flex flex-col items-center justify-center p-8 bg-gray-800 bg-opacity-50 rounded-lg'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400'></div>
      <p className='text-yellow-300 mt-4 text-lg'>{text}</p>
    </div>
  );
};
