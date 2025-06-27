// src/components/ui/PaginationButton.jsx
import React from "react";

const PaginationButton = ({
  onClick,
  disabled,
  ariaLabel,
  children,
  isActive = false,
}) => {
  const baseClasses = `px-2.5 py-1.5 text-sm font-medium rounded-md border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800`;
  const activeClasses = "bg-sky-500 text-white border-sky-500 cursor-default";
  const inactiveClasses =
    "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
<button
  type="button"
  onClick={!disabled ? onClick : undefined} // منع النقر إذا كان معطلاً
  disabled={disabled}
  aria-label={ariaLabel}
  className={`${baseClasses} ${
    isActive ? activeClasses : inactiveClasses
  } ${disabled ? disabledClasses : ""}`}
>
  {children}
</button>
  );
};
export default PaginationButton;
