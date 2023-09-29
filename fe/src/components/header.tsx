import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import HeaderLink from "../components/header-link";

interface HeaderProps {}

const Header: FunctionComponent<HeaderProps> = () => {
  return (
    <div className="header-container h-12 md:h-16 w-full bg-black bg-opacity-40">
      <div className="header-content-container max-w-4xl h-full m-auto flex items-center gap-4 md:gap-16">
        <Link
          to="/"
          className="ml-4 logo font-logo flex items-center font-bold tracking-tighter text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-fuchsia-500"
        >
          DOPUNI.BA
        </Link>
        {/* <HeaderLink to="/trening">Trening</HeaderLink> */}
        {/* <HeaderLink to="/pravila">Upute</HeaderLink> */}
      </div>
    </div>
  );
};

export default Header;
