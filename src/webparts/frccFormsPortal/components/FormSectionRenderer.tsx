/* eslint-disable @rushstack/no-new-null */
import * as React from "react";
import type { IField } from "../../../services/SchemaService";
import styles from "./FrccFormsPortal.module.scss";

type SectionLayout = "oneColumn" | "twoColumn" | "single-column" | "two-column";

interface ISectionConfig {
  title: string;
  description?: string;
  layout?: SectionLayout;
  fields: string[];
}

interface IFormJsonConfig {
  layout?:
    | "single-column"
    | "two-column"
    | {
        rows?: string[][];
      };
  hideSectionHeaders?: boolean;
  sections?: ISectionConfig[];
}

export interface IFormSectionRendererProps {
  config: IFormJsonConfig;
  renderableFields: IField[];
  formSpecificPresentation: boolean;
  accentColor: string;
  themeTextSecondary: string;
  sectionHeaderStyle: React.CSSProperties;
  normalizeLayout: (layout?: SectionLayout) => "oneColumn" | "twoColumn";
  renderRowsLayout: () => React.ReactElement | null;
  renderConfiguredFieldByName: (fieldName: string) => React.ReactElement | null;
  getFieldWrapperClass: (field: IField) => string;
  renderField: (field: IField) => React.ReactElement;
}

export default function FormSectionRenderer(
  props: IFormSectionRendererProps,
): React.ReactElement<IFormSectionRendererProps> {
  const {
    config,
    renderableFields,
    formSpecificPresentation,
    accentColor,
    themeTextSecondary,
    sectionHeaderStyle,
    normalizeLayout,
    renderRowsLayout,
    renderConfiguredFieldByName,
    getFieldWrapperClass,
    renderField,
  } = props;

  const sections = config.sections || [];
  const defaultLayout =
    typeof config.layout === "string"
      ? normalizeLayout(config.layout)
      : "twoColumn";

  if (sections.length === 0) {
    return (
      <div key="default-section">
        {renderRowsLayout() || (
          <div
            className={defaultLayout === "oneColumn" ? "" : styles.sectionGrid}
          >
            {renderableFields.map((field) => (
              <div
                key={field.internalName}
                className={
                  defaultLayout === "oneColumn"
                    ? styles.sectionFull
                    : getFieldWrapperClass(field)
                }
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderedFieldNames: string[] = [];

  const sectionElements = sections.map((section, sectionIndex) => {
    const sectionLayout = normalizeLayout(section.layout || defaultLayout);
    const sectionFields = section.fields
      .map((fieldName) => {
        if (fieldName === "Attachments") return undefined;

        return renderableFields.filter(
          (field) => field.internalName === fieldName,
        )[0];
      })
      .filter((field): field is IField => field !== undefined);

    section.fields.forEach((fieldName) => renderedFieldNames.push(fieldName));

    const configuredElements = section.fields
      .map((fieldName) => renderConfiguredFieldByName(fieldName))
      .filter((element): element is React.ReactElement => element !== null);

    const showSectionHeader =
      !config.hideSectionHeaders && section.title && section.title.trim() !== "";

    return (
      <div
        key={section.title || `section-${sectionIndex}`}
        style={{
          marginBottom: formSpecificPresentation ? "32px" : "36px",
          paddingBottom: formSpecificPresentation ? "6px" : undefined,
        }}
      >
        {showSectionHeader && (
          <h3
            style={{
              ...sectionHeaderStyle,
              background: `linear-gradient(90deg, ${accentColor} 0%, #006fbf 100%)`,
              marginBottom: section.description ? "12px" : "22px",
              letterSpacing: "0.01em",
            }}
          >
            {section.title}
          </h3>
        )}

        {section.description && !config.hideSectionHeaders && (
          <div
            style={{
              fontSize: "13px",
              color: themeTextSecondary,
              lineHeight: 1.6,
              marginBottom: "22px",
              maxWidth: "820px",
            }}
          >
            {section.description}
          </div>
        )}

        <div
          className={sectionLayout === "oneColumn" ? "" : styles.sectionGrid}
          style={
            sectionLayout === "oneColumn"
              ? undefined
              : formSpecificPresentation
                ? { gap: "0 36px" }
                : undefined
          }
        >
          {configuredElements.map((element, index) => {
            const field = sectionFields[index];

            return (
              <div
                key={element.key || `configured-field-${index}`}
                className={
                  sectionLayout === "oneColumn"
                    ? styles.sectionFull
                    : field
                      ? getFieldWrapperClass(field)
                      : styles.sectionFull
                }
              >
                {element}
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  const remainingFields = renderableFields.filter(
    (field) => renderedFieldNames.indexOf(field.internalName) === -1,
  );

  if (remainingFields.length > 0) {
    sectionElements.push(
      <div key="other-fields" style={{ marginBottom: formSpecificPresentation ? "32px" : "36px" }}>
        {!config.hideSectionHeaders && (
          <h3
            style={{
              ...sectionHeaderStyle,
              background: `linear-gradient(90deg, ${accentColor} 0%, #006fbf 100%)`,
              marginBottom: "22px",
            }}
          >
            Other Information
          </h3>
        )}

        <div
          className={defaultLayout === "oneColumn" ? "" : styles.sectionGrid}
        >
          {remainingFields.map((field) => (
            <div
              key={field.internalName}
              className={
                defaultLayout === "oneColumn"
                  ? styles.sectionFull
                  : getFieldWrapperClass(field)
              }
            >
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>,
    );
  }

  return <>{sectionElements}</>;
}
