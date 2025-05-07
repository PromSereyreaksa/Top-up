"use client"

import { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const modalRef = useRef(null);
  const [isShowing, setIsShowing] = useState(false);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Close modal with ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Map size prop to appropriate max-width
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div 
        ref={modalRef} 
        className={`bg-white rounded-xl shadow-lg w-full ${sizeClasses[size] || 'max-w-lg'} max-h-[85vh] overflow-y-auto 
          transform transition-all duration-300 ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <h2 id="modal-title" className="text-xl font-medium text-gray-800 m-0">{title}</h2>
          <button 
            className="bg-transparent border-0 text-lg text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;