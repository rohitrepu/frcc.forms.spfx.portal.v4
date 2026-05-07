/* eslint-disable @rushstack/no-new-null */
import * as React from "react";
import styles from "./FrccFormsPortal.module.scss";

interface IAttachmentItem {
  id: string;
  file: File;
}

interface IFieldUiConfig {
  label?: string;
  description?: string;
  helpText?: string;
  placeholder?: string;
  width?: "half" | "full" | "100%";
  readOnly?: boolean;
  hidden?: boolean;
  rows?: number;
  buttonText?: string;
}

interface IFormThemeConfig {
  labelFontSize?: string;
  labelColor?: string;
  descriptionColor?: string;
}

export interface IFormAttachmentRendererProps {
  fieldUiConfig?: IFieldUiConfig;
  labelStyle: React.CSSProperties;
  formSpecificPresentation: boolean;
  configTheme?: IFormThemeConfig;
  themeTextSecondary: string;
  attachmentInputRef: React.RefObject<HTMLInputElement>;
  attachmentItems: IAttachmentItem[];
  handleAttachmentSelection: (files: FileList | null) => void;
  removeAttachment: (attachmentId: string) => void;
}

export default function FormAttachmentRenderer(
  props: IFormAttachmentRendererProps,
): React.ReactElement<IFormAttachmentRendererProps> | null {
  const {
    fieldUiConfig,
    labelStyle,
    formSpecificPresentation,
    configTheme,
    themeTextSecondary,
    attachmentInputRef,
    attachmentItems,
    handleAttachmentSelection,
    removeAttachment,
  } = props;

  if (fieldUiConfig?.hidden === true) return null;

  const label = fieldUiConfig?.label || "Attachments";
  const help = fieldUiConfig?.description || fieldUiConfig?.helpText;
  const buttonText = fieldUiConfig?.buttonText || "Add attachments";

  return (
    <div
      key="Attachments"
      style={{ marginBottom: formSpecificPresentation ? "30px" : "12px" }}
    >
      <label
        style={{
          ...labelStyle,
          fontSize: configTheme?.labelFontSize || labelStyle.fontSize,
          fontWeight: formSpecificPresentation ? 500 : labelStyle.fontWeight,
          color: configTheme?.labelColor || labelStyle.color,
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      {help && (
        <div
          style={{
            fontSize: formSpecificPresentation ? "13px" : "12px",
            color: configTheme?.descriptionColor || themeTextSecondary,
            lineHeight: 1.55,
            marginBottom: "10px",
          }}
        >
          {help}
        </div>
      )}

      <input
        ref={attachmentInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(event) => handleAttachmentSelection(event.target.files)}
      />

      <button
        type="button"
        className={styles.secondaryButton}
        onClick={() => attachmentInputRef.current?.click()}
        style={{
          borderColor: formSpecificPresentation ? "#b9b9b9" : undefined,
          borderRadius: formSpecificPresentation ? "3px" : undefined,
          background: "#ffffff",
          color: "#333333",
          padding: formSpecificPresentation ? "8px 14px" : undefined,
          fontWeight: 600,
        }}
      >
        + {buttonText}
      </button>

      {attachmentItems.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            display: "grid",
            gap: "8px",
          }}
        >
          {attachmentItems.map((attachment) => (
            <div
              key={attachment.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "8px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "#ffffff",
                fontSize: "13px",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {attachment.file.name}
              </span>

              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#a4262c",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                aria-label={`Remove ${attachment.file.name}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
