import React, { useRef } from "react";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  headingsPlugin,
  InsertCodeBlock,
  InsertTable,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import { useTranslation } from "react-i18next";

import InfoIcon from "svgs/icons/info-circle.svg";

import { cn } from "utils/cn";
import { isValidUrl } from "utils/urlValidation";

import "@mdxeditor/editor/style.css";

interface IMarkdownEditor {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showMessage?: boolean;
}

const MarkdownEditor: React.FC<IMarkdownEditor> = ({ value, onChange, placeholder, showMessage = true }) => {
  const { t } = useTranslation();
  const editorRef = useRef<MDXEditorMethods>(null);
  const effectivePlaceholder = placeholder ?? t("forms.placeholders.justify_your_vote");

  const handleChange = (markdown: string) => {
    let cleanedMarkdown = markdown === "\u200B" ? "" : markdown.replace(/^\u200B/, "");
    // Remove ALL escape characters - no exceptions
    cleanedMarkdown = cleanedMarkdown.replace(/\\([`[]*_#|>-+=~^{}()!&<$%\\])/g, "$1");
    // Also handle multiple consecutive backslashes that might accumulate
    cleanedMarkdown = cleanedMarkdown.replace(/\\+/g, "");

    onChange(cleanedMarkdown);
  };

  const handleContainerClick = () => {
    if (isEmpty && editorRef.current) {
      editorRef.current.setMarkdown("\u200B");
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const isEmpty = !value || value.trim() === "";

  const editorProps: MDXEditorProps = {
    markdown: value,
    onChange: handleChange,
    placeholder: effectivePlaceholder,
    suppressHtmlProcessing: true,
    plugins: [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin({
        validateUrl: (url) => isValidUrl(url),
      }),
      linkDialogPlugin(),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          text: "Code",
        },
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <Separator />
            <BoldItalicUnderlineToggles />
            <InsertCodeBlock />
            <Separator />
            <BlockTypeSelect />
            <Separator />
            <ListsToggle />
            <Separator />
            <CreateLink />
            <InsertTable />
          </>
        ),
      }),
    ],
  };

  return (
    <>
      <div className="mdx-editor-container" onClick={handleContainerClick} role="region" aria-label="Markdown editor">
        <MDXEditor ref={editorRef} {...editorProps} aria-label="Rich text editor for markdown content" />
        {showMessage && (
          <div className="flex items-start gap-2 mt-2">
            <InfoIcon
              className={cn(
                "w-[16px] h-[16px] fill-klerosUIComponentsSecondaryText! shrink-0 mt-0.5",
                "[&_path]:fill-klerosUIComponentsSecondaryText! [&_*]:fill-klerosUIComponentsSecondaryText!"
              )}
            />
            <small className="text-[14px] font-normal text-klerosUIComponentsSecondaryText [hyphens:auto] leading-[1.4]">
              {t("voting.justification_message")}
            </small>
          </div>
        )}
      </div>
    </>
  );
};

export default MarkdownEditor;
