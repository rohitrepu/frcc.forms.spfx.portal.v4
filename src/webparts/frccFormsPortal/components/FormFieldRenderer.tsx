import * as React from "react";
import type { IField, ILookupOption } from "../../../services/SchemaService";

type FormValue = string | number | boolean | string[] | undefined;
type TransformType = "trim" | "uppercase" | "lowercase" | "upper" | "lower";

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

interface IValidationRule {
  required?: boolean;
  message?: string;
  warning?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

interface IPeopleSuggestion {
  key: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

interface IFormJsonConfig {
  validation?: {
    [internalName: string]: IValidationRule;
  };
  transform?: {
    [internalName: string]: TransformType;
  };
  theme?: {
    labelFontSize?: string;
    labelColor?: string;
    descriptionColor?: string;
    inputBackground?: string;
    inputBorder?: string;
  };
}

export interface IFormFieldRendererProps {
  field: IField;
  fieldUiConfig?: IFieldUiConfig;
  label: string;
  help?: string;
  value: FormValue;
  config: IFormJsonConfig;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  formSpecificPresentation: boolean;
  theme: {
    text: {
      secondary: string;
    };
  };
  lookupOptions: {
    [fieldName: string]: ILookupOption[];
  };
  validationWarnings: {
    [fieldName: string]: string;
  };
  validationErrors: {
    [fieldName: string]: string;
  };
  activePeopleFieldName: string;
  peopleSuggestions: {
    [fieldName: string]: IPeopleSuggestion[];
  };
  handleChange: (fieldName: string, value: FormValue) => void;
  queuePeopleSearch: (fieldName: string, query: string) => void;
  selectPeopleSuggestion: (
    fieldName: string,
    suggestion: IPeopleSuggestion,
  ) => void;
  setActivePeopleFieldName: React.Dispatch<React.SetStateAction<string>>;
}

export default function FormFieldRenderer(
  props: IFormFieldRendererProps,
): React.ReactElement<IFormFieldRendererProps> {
  const {
    field,
    fieldUiConfig,
    label,
    help,
    value,
    config,
    inputStyle,
    labelStyle,
    formSpecificPresentation,
    theme,
    lookupOptions,
    validationWarnings,
    validationErrors,
    activePeopleFieldName,
    peopleSuggestions,
    handleChange,
    queuePeopleSearch,
    selectPeopleSuggestion,
    setActivePeopleFieldName,
  } = props;

  const readOnly = fieldUiConfig && fieldUiConfig.readOnly === true;
  const required =
    field.required ||
    (config.validation &&
      config.validation[field.internalName] &&
      config.validation[field.internalName].required);
  const inputBackground = config.theme?.inputBackground || inputStyle.background;
  const inputBorder =
    config.theme?.inputBorder === "none"
      ? "none"
      : config.theme?.inputBorder || inputStyle.border;
  const fieldInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: inputBackground,
    border: inputBorder,
    borderRadius: formSpecificPresentation ? "5px" : inputStyle.borderRadius,
    minHeight: formSpecificPresentation ? "42px" : "40px",
    fontSize: formSpecificPresentation ? "14px" : inputStyle.fontSize,
    lineHeight: 1.45,
    boxSizing: "border-box",
    boxShadow: config.theme?.inputBorder === "none" ? "none" : undefined,
  };
  const fieldLabelStyle: React.CSSProperties = {
    ...labelStyle,
    fontSize: config.theme?.labelFontSize || labelStyle.fontSize,
    fontWeight: formSpecificPresentation ? 600 : labelStyle.fontWeight,
    color: config.theme?.labelColor || labelStyle.color,
    marginBottom: help ? "7px" : "9px",
    lineHeight: 1.35,
  };
  const helpStyle: React.CSSProperties = {
    fontSize: formSpecificPresentation ? "13px" : "12px",
    color: config.theme?.descriptionColor || theme.text.secondary,
    lineHeight: 1.6,
    marginBottom: "12px",
    maxWidth: "760px",
  };

  return (
    <div
      key={field.internalName}
      style={{ marginBottom: formSpecificPresentation ? "34px" : "18px" }}
    >
      <label style={fieldLabelStyle}>
        {label}
        {required && <span style={{ color: "#a4262c" }}> *</span>}
      </label>

      {help && <div style={helpStyle}>{help}</div>}

      {field.typeAsString === "Text" && (
        <input
          type="text"
          placeholder={fieldUiConfig ? fieldUiConfig.placeholder : undefined}
          disabled={readOnly}
          style={fieldInputStyle}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(field.internalName, event.target.value)
          }
        />
      )}

      {field.typeAsString === "Note" && (
        <textarea
          placeholder={fieldUiConfig ? fieldUiConfig.placeholder : undefined}
          disabled={readOnly}
          rows={fieldUiConfig?.rows || (formSpecificPresentation ? 6 : undefined)}
          style={{
            ...fieldInputStyle,
            minHeight: formSpecificPresentation ? "96px" : undefined,
            resize: "vertical",
          }}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(field.internalName, event.target.value)
          }
        />
      )}

      {field.typeAsString === "Choice" && (
        <select
          disabled={readOnly}
          style={fieldInputStyle}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(field.internalName, event.target.value)
          }
        >
          <option value="">
            {fieldUiConfig?.placeholder || "Select..."}
          </option>
          {field.choices?.map((choice: string) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      )}

      {field.typeAsString === "MultiChoice" && (
        <select
          multiple
          disabled={readOnly}
          style={{ ...fieldInputStyle, minHeight: "96px" }}
          value={(value as string[]) || []}
          onChange={(event) => {
            const selectedValues = Array.from(
              event.target.selectedOptions,
            ).map((option) => option.value);
            handleChange(field.internalName, selectedValues);
          }}
        >
          {field.choices?.map((choice: string) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      )}

      {(field.typeAsString === "Number" ||
        field.typeAsString === "Currency") && (
        <input
          type="number"
          placeholder={fieldUiConfig ? fieldUiConfig.placeholder : undefined}
          disabled={readOnly}
          style={fieldInputStyle}
          value={value === undefined ? "" : String(value)}
          onChange={(event) => {
            const nextValue = event.target.value;
            handleChange(
              field.internalName,
              nextValue === "" ? undefined : Number(nextValue),
            );
          }}
        />
      )}

      {field.typeAsString === "Boolean" && (
        <input
          type="checkbox"
          disabled={readOnly}
          checked={Boolean(value)}
          onChange={(event) =>
            handleChange(field.internalName, event.target.checked)
          }
        />
      )}

      {field.typeAsString === "DateTime" && (
        <input
          type="date"
          disabled={readOnly}
          style={fieldInputStyle}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(field.internalName, event.target.value)
          }
        />
      )}

      {field.typeAsString === "User" && (
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder={
              fieldUiConfig && fieldUiConfig.placeholder
                ? fieldUiConfig.placeholder
                : "Enter a name or email address"
            }
            disabled={readOnly}
            style={fieldInputStyle}
            value={String(value || "")}
            onFocus={() => setActivePeopleFieldName(field.internalName)}
            onBlur={() => {
              window.setTimeout(() => {
                setActivePeopleFieldName((current) =>
                  current === field.internalName ? "" : current,
                );
              }, 180);
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              handleChange(field.internalName, nextValue);
              queuePeopleSearch(field.internalName, nextValue);
            }}
          />

          {activePeopleFieldName === field.internalName &&
            (peopleSuggestions[field.internalName] || []).length > 0 && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  maxHeight: "240px",
                  overflowY: "auto",
                  border: "1px solid #c8c6c4",
                  borderRadius: "4px",
                  background: "#ffffff",
                  boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                }}
              >
                {(peopleSuggestions[field.internalName] || []).map(
                  (suggestion) => (
                    <button
                      key={suggestion.key}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() =>
                        selectPeopleSuggestion(field.internalName, suggestion)
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 10px",
                        border: "none",
                        borderBottom: "1px solid #f3f4f6",
                        background: "#ffffff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#e5e7eb",
                          color: "#64748b",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {(suggestion.displayName || suggestion.email)
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            color: "#111827",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {suggestion.displayName}
                        </span>
                        <span
                          style={{
                            display: "block",
                            color: "#6b7280",
                            fontSize: "12px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {suggestion.email}
                        </span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
        </div>
      )}

      {field.typeAsString === "Lookup" && (
        <select
          disabled={readOnly}
          style={fieldInputStyle}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(
              field.internalName,
              event.target.value === ""
                ? undefined
                : Number(event.target.value),
            )
          }
        >
          <option value="">
            {fieldUiConfig?.placeholder || "Select..."}
          </option>
          {(lookupOptions[field.internalName] || []).map(
            (option: ILookupOption) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ),
          )}
        </select>
      )}

      {field.typeAsString === "URL" && (
        <input
          type="url"
          placeholder={fieldUiConfig ? fieldUiConfig.placeholder : undefined}
          disabled={readOnly}
          style={fieldInputStyle}
          value={String(value || "")}
          onChange={(event) =>
            handleChange(field.internalName, event.target.value)
          }
        />
      )}

      {[
        "Text",
        "Note",
        "Choice",
        "MultiChoice",
        "Number",
        "Currency",
        "Boolean",
        "DateTime",
        "User",
        "Lookup",
        "URL",
      ].indexOf(field.typeAsString) === -1 && (
        <input
          type="text"
          disabled
          placeholder={`Unsupported: ${field.typeAsString}`}
          style={fieldInputStyle}
        />
      )}

      {validationWarnings[field.internalName] && (
        <div
          style={{
            color: "#8a6d00",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: 1.45,
            marginTop: "8px",
            padding: "8px 10px",
          }}
        >
          {validationWarnings[field.internalName]}
        </div>
      )}

      {validationErrors[field.internalName] && (
        <div
          style={{
            color: "#991b1b",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "12px",
            lineHeight: 1.45,
            marginTop: "8px",
            padding: "8px 10px",
          }}
        >
          {validationErrors[field.internalName]}
        </div>
      )}
    </div>
  );
}
