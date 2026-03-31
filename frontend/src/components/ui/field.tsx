import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  dataInvalid?: boolean;
  dataDisabled?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", dataInvalid, dataDisabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-invalid={dataInvalid}
        data-disabled={dataDisabled}
        className={cn(
          "flex gap-3",
          orientation === "horizontal" && "items-center justify-between",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      />
    );
  }
);
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="field-label"
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: number }
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn("flex flex-col", className)}
    style={spacing ? { gap: `${spacing * 0.25}rem` } : undefined}
    {...props}
  />
));
FieldGroup.displayName = "FieldGroup";

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.HTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    data-slot="fieldset"
    className={cn("flex flex-col gap-3", className)}
    {...props}
  />
));
FieldSet.displayName = "FieldSet";

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & { variant?: "label" | "heading" }
>(({ className, variant = "label", ...props }, ref) => (
  <legend
    ref={ref}
    data-slot="field-legend"
    className={cn(
      variant === "heading" && "text-lg font-semibold",
      variant === "label" && "text-sm font-medium",
      className
    )}
    {...props}
  />
));
FieldLegend.displayName = "FieldLegend";

export { Field, FieldLabel, FieldDescription, FieldGroup, FieldSet, FieldLegend };
