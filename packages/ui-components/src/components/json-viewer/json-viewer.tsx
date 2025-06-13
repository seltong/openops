import React from 'react';
import { useForm } from 'react-hook-form';
import { FileButton } from './file-button';
import { HeaderButtons } from './header-buttons';
import { JsonContent } from './json-content';
import { useJsonViewer } from './json-viewer-hook';
import { renderFileButton } from './render-file-button';

type JsonViewerProps = {
  json: any;
  title: string;
  readonly?: boolean;
  onChange?: (json: any) => void;
  theme?: string;
  editorClassName?: string;
};

export type JsonFormValues = {
  jsonContent: string;
};

const JsonViewer = React.memo(
  ({
    json,
    title,
    readonly = true,
    onChange,
    theme,
    editorClassName,
  }: JsonViewerProps) => {
    const form = useForm<JsonFormValues>({
      defaultValues: {
        jsonContent: json,
      },
      mode: 'onChange',
    });

    const {
      handleCopy,
      handleDownload,
      handleDownloadFile,
      handleDelete,
      isFileUrl,
      isEditMode,
      setIsEditMode,
      apply,
    } = useJsonViewer({
      json,
      title,
      readonly,
      renderFileButton,
      onChange,
      form,
    });

    if (isFileUrl) {
      return (
        <FileButton fileUrl={json} handleDownloadFile={handleDownloadFile} />
      );
    }

    return (
      <div className="rounded-lg border border-solid">
        <div className="px-4 py-3 flex items-center gap-2 h-[61px]">
          <div className="flex-grow justify-center items-center">
            <span className="text-base font-medium">{title}</span>
          </div>
          <HeaderButtons
            isEditMode={isEditMode}
            readonly={readonly}
            handleCopy={handleCopy}
            handleDownload={handleDownload}
            handleEdit={() => setIsEditMode(true)}
            handleDelete={handleDelete}
            showDeleteButton={!!json}
            apply={() => {
              apply(form.getValues('jsonContent'));
            }}
          />
        </div>
        <JsonContent
          isEditMode={isEditMode}
          json={json}
          form={form}
          theme={theme}
          editorClassName={editorClassName}
        />
      </div>
    );
  },
);

JsonViewer.displayName = 'JsonViewer';
export { JsonViewer };
