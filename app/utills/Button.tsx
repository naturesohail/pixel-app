import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  type = "submit", 
  isLoading = false, 
  children, 
  className = "", 
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`relative inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={isLoading}
      style={isLoading ? { pointerEvents: "none" } : {}}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 text-white absolute left-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      )}
      <span className={isLoading ? "ml-6" : ""}>
        {isLoading ? "Processing..." : children}
      </span>
    </button>
  );
};

export default Button;
