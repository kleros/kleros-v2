import React from "react";

interface IRank {
  rank: number;
}

const Rank: React.FC<IRank> = ({ rank }) => {
  return (
    <div
      className={
        'text-klerosUIComponentsPrimaryText [&::before]:[content:"#"] [&::before]:inline lg:flex lg:items-center lg:justify-start lg:[&::before]:hidden'
      }
    >
      {rank}
    </div>
  );
};
export default Rank;
