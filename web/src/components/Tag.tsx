import React from "react";
import { Tag as BaseTag } from "@kleros/ui-components-library";

interface ITag {
  text: string;
  active: boolean;
  onClick: () => void;
}
const Tag: React.FC<ITag> = ({ text, active, onClick }) => {
  return (
    <div onClick={onClick}>
      <BaseTag text={text} active={active} />
    </div>
  );
};

export default Tag;
