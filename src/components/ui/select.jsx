import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-9 w-full items-center justify-between rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/40',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={14} className="opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export function SelectContent({ className, children, ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'z-50 overflow-hidden rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-md',
          className
        )}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-7 pr-3 text-sm outline-none hover:bg-gray-100 dark:hover:bg-white/10 data-[state=checked]:font-medium',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={14} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
