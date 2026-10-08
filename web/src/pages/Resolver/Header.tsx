import React from "react";

interface IHeader {
  text: string;
}

const Header: React.FC<IHeader> = ({ text }) => {
  return <h1 className="mb-8 w-[84vw] text-center lg:w-auto">{text}</h1>;
};
export default Header;
