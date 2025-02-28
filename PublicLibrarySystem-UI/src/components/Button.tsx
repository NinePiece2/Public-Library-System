import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  className = "",
  children,
  onClick,
}) => {
  return (
    <button type={type} onClick={onClick} className={` py-2 rounded transition cursor-pointer ${className}`}>
      {children}
    </button>
  );
};

export default Button;
