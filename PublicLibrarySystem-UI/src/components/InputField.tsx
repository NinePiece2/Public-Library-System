import React from "react";

export interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  style,
  className = "",
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={style}
        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 ${className}`}
      />
    </div>
  );
};

export default InputField;
