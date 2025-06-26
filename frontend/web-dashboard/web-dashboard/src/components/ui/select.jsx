import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  
  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            selectedValue,
            onValueChange: handleValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, className = '', isOpen, setIsOpen, selectedValue }) => {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-input
        bg-background px-3 py-2 text-sm ring-offset-background
        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectValue = ({ placeholder, selectedValue }) => {
  return (
    <span className={selectedValue ? 'text-foreground' : 'text-muted-foreground'}>
      {selectedValue || placeholder}
    </span>
  );
};

const SelectContent = ({ children, isOpen, selectedValue, onValueChange }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        // Close logic would be handled by parent
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className="absolute top-full left-0 z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              selectedValue,
              onValueChange
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({ children, value, selectedValue, onValueChange }) => {
  const isSelected = selectedValue === value;
  
  return (
    <div
      onClick={() => onValueChange(value)}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm
        outline-none hover:bg-accent hover:text-accent-foreground
        ${isSelected ? 'bg-accent text-accent-foreground' : ''}
        cursor-pointer
      `}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
