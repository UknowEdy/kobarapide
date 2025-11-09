import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // The toast will disappear after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className={`fixed bottom-5 right-5 ${colors[type]} text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out`}>
      {message}
    </div>
  );
};

// Add keyframes for animation in a style tag or your main CSS file if preferred
const toastAnimation = `
@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
.animate-fade-in-out {
  animation: fade-in-out 3s ease-in-out forwards;
}
`;

// Inject styles into the head
const styleSheet = document.createElement("style");
styleSheet.innerText = toastAnimation;
document.head.appendChild(styleSheet);


export default Toast;
