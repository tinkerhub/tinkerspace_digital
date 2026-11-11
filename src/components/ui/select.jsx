import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const SelectContext = createContext({
  value: '',
  onValueChange: () => {},
  placeholder: '',
  setPlaceholder: () => {},
});

export function Select({ value, onValueChange, children }) {
  const [placeholder, setPlaceholder] = useState('');
  return (
    <SelectContext.Provider value={{ value: value || '', onValueChange, placeholder, setPlaceholder }}>
      <div className="relative inline-block w-auto">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }) {
  return <div className={cn('relative', className)}>{children}</div>;
}

export function SelectValue({ placeholder, children }) {
  const { setPlaceholder } = useContext(SelectContext);
  const text = placeholder || children;
  useEffect(() => {
    if (text) {
      setPlaceholder(typeof text === 'string' ? text : String(text));
    }
  }, [text, setPlaceholder]);
  return null;
}

export function SelectContent({ children, className }) {
  const { value, onValueChange, placeholder } = useContext(SelectContext);
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <select
      value={value}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      className={cn(
        'flex h-9 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer',
        className
      )}
    >
      <option value="" disabled>{placeholder || 'Select option'}</option>
      {items.map((child) => {
        if (!child || !child.props) return null;
        return (
          <option key={child.props.value} value={child.props.value}>
            {child.props.children}
          </option>
        );
      })}
    </select>
  );
}

export function SelectItem({ value, children }) {
  return null;
}
