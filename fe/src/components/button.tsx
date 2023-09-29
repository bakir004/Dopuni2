import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  rounded?: boolean;
  outlined?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  to?: string;
  onClickFunction?: () => void;
}

const Button: FunctionComponent<ButtonProps> = (props) => {
  return props.to !== "" && !props.onClickFunction ? (
    <Link
      to={props.to ? props.to : ""}
      className={`${props.rounded ? "rounded-full" : "rounded"} ${
        props.outlined
          ? "bg-white hover:bg-white text-primary border-primary border hover:border-primary-light hover:text-primary-light"
          : "bg-primary text-white font-semibold tracking-wide hover:bg-primary-light"
      } ${
        props.disabled
          ? "bg-primary-superlight hover:bg-primary-superlight cursor-default pointer-events-none"
          : "cursor-pointer"
      } block h-6 sm:h-8 w-fit px-2 py-1 transition`}
    >
      <span className="flex gap-1 items-center">{props.children}</span>
    </Link>
  ) : (
    <div
      onClick={() => (props.onClickFunction ? props.onClickFunction() : null)}
      className={`${props.rounded ? "rounded-full" : "rounded"} ${
        props.outlined
          ? "bg-white hover:bg-white text-primary border-primary border hover:border-primary-light hover:text-primary-light"
          : "bg-primary text-white font-semibold tracking-wide hover:bg-primary-light"
      } ${
        props.disabled
          ? "bg-primary-superlight hover:bg-primary-superlight cursor-default pointer-events-none"
          : "cursor-pointer"
      } block h-6 text-xs sm:text-base sm:h-8 w-fit px-3 py-1 transition`}
    >
      <span className="flex gap-1 items-center">{props.children}</span>
    </div>
  );
};

export default Button;
