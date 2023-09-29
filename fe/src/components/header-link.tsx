import * as React from "react";
import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

interface HeaderLinkProps {
  children: React.ReactNode;
  to: string;
}

const HeaderLink: FunctionComponent<HeaderLinkProps> = (props) => {
  return (
    <Link
      to={props.to}
      className="link font-semibold md:text-lg text-sm uppercase text-white hover:scale-110 transition"
    >
      {props.children}
    </Link>
  );
};

export default HeaderLink;
