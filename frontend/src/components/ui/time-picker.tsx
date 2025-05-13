
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TimePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        type="time"
        className={cn(className)}
        ref={ref}
        {...props}
      />
    );
  }
);

TimePicker.displayName = "TimePicker";

export { TimePicker };
