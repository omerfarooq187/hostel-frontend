// components/Button.jsx
export default function Button({ children, variant = "primary", ...props }) {
  const baseClasses = "px-8 py-3.5 rounded-btn font-bold transition-colors";
  
  const variants = {
    primary: "bg-heading-color hover:bg-primary text-light-color",
    secondary: "border-2 border-heading-color hover:bg-heading-color hover:text-light-color text-heading-color",
    outline: "border-2 border-primary hover:bg-primary hover:text-light-color text-primary",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}