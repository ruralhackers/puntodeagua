import * as React from "react";
import { cn } from "@/lib/utils";

const Form = React.forwardRef<
	HTMLFormElement,
	React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
	<form
		ref={ref}
		className={cn("space-y-4", className)}
		{...props}
	/>
));
Form.displayName = "Form";

const FormField = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormField.displayName = "FormField";

const FormLabel = React.forwardRef<
	HTMLLabelElement,
	React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
	<label
		ref={ref}
		className={cn("text-sm font-medium text-gray-900", className)}
		{...props}
	/>
));
FormLabel.displayName = "FormLabel";

const FormMessage = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-red-600", className)}
		{...props}
	/>
));
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormLabel, FormMessage };