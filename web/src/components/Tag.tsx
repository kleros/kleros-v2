import React from "react";

import { Tag as BaseTag } from "@kleros/ui-components-library";

interface ITag {
  text: string;
  active: boolean;
  onClick: () => void;
}

// The library `Tag` is a react-aria button; its press events stop propagation,
// so an outer native onClick wouldn't fire — pass the handler as `onPress`.
const Tag: React.FC<ITag> = ({ text, active, onClick }) => {
  return <BaseTag text={text} active={active} onPress={onClick} />;
};

export default Tag;
