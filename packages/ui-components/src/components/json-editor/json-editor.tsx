import { json } from '@codemirror/lang-json';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import CodeMirror, {
  EditorState,
  EditorView,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import React, { RefObject, useRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { cn } from '../../lib/cn';

const styleTheme = EditorView.baseTheme({
  '&.cm-editor.cm-focused': {
    outline: 'none',
  },
});

const convertToString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value, null, 2);
};

const tryParseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

type JsonEditorProps = {
  field: ControllerRenderProps<Record<string, any>, string>;
  readonly: boolean;
  onFocus?: (ref: RefObject<ReactCodeMirrorRef>) => void;
  className?: string;
  containerClassName?: string;
  theme?: string;
  placeholder?: string;
};

const JsonEditor = React.memo(
  ({
    field,
    readonly,
    onFocus,
    className,
    containerClassName,
    theme,
    placeholder,
  }: JsonEditorProps) => {
    const [value, setValue] = useState(convertToString(field.value));
    const editorTheme = theme === 'dark' ? githubDark : githubLight;
    const extensions = [
      styleTheme,
      EditorState.readOnly.of(readonly),
      EditorView.editable.of(!readonly),
      json(),
    ];
    const ref = useRef<ReactCodeMirrorRef>(null);
    return (
      <div
        className={cn(
          'flex flex-col gap-2 border rounded py-2 px-2',
          containerClassName,
        )}
      >
        <CodeMirror
          ref={ref}
          value={value}
          placeholder={placeholder}
          className={cn('border-none', className)}
          height="250px"
          width="100%"
          maxWidth="100%"
          basicSetup={{
            foldGutter: false,
            lineNumbers: true,
            searchKeymap: false,
            lintKeymap: true,
            autocompletion: true,
          }}
          lang="json"
          onChange={(value) => {
            setValue(value);
            field.onChange(tryParseJson(value));
          }}
          theme={editorTheme}
          readOnly={readonly}
          onFocus={() => onFocus?.(ref)}
          extensions={extensions}
        />
      </div>
    );
  },
);

JsonEditor.displayName = 'JsonEditor';
export { JsonEditor };
