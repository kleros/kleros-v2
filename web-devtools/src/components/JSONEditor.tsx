import React, { useEffect, useRef } from "react";

import {
  createJSONEditor,
  type JSONEditorPropsOptional,
  type JsonEditor as VanillaJsonEditor,
} from "vanilla-jsoneditor";

import { cn } from "utils/cn";

const JSONEditor = (props: any) => {
  const refContainer = useRef<HTMLDivElement | null>(null);
  const refEditor = useRef<VanillaJsonEditor | null>(null);
  const refPrevProps = useRef<JSONEditorPropsOptional>(props);

  useEffect(() => {
    refEditor.current = createJSONEditor({
      target: refContainer.current as HTMLDivElement,
      props,
    });

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update props
  useEffect(() => {
    if (refEditor.current) {
      const changedProps = filterUnchangedProps(props, refPrevProps.current);
      refEditor.current.updateProps(changedProps);
      refPrevProps.current = props;
    }
  }, [props]);

  return (
    <div
      ref={refContainer}
      className={cn("json-editor h-[calc(100vh-180px)] w-full lg:h-[calc(100vh-300px)] lg:w-[30vw]", props.className)}
    />
  );
};

function filterUnchangedProps(
  props: JSONEditorPropsOptional,
  prevProps: JSONEditorPropsOptional
): JSONEditorPropsOptional {
  return Object.fromEntries(
    Object.entries(props).filter(([key, value]) => value !== prevProps[key as keyof JSONEditorPropsOptional])
  );
}

export default JSONEditor;
