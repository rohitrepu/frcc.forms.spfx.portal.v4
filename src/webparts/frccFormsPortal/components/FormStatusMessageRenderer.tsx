import * as React from "react";

export type FormStatusMessageVariant = "error" | "success" | "info" | "warning";

export interface IFormStatusMessageRendererProps {
  variant: FormStatusMessageVariant;
  message: string;
  title?: string;
}

const getStatusStyles = (
  variant: FormStatusMessageVariant,
): {
  icon: string;
  title: string;
  color: string;
  background: string;
  border: string;
} => {
  if (variant === "success") {
    return {
      icon: "✓",
      title: "Success",
      color: "#166534",
      background: "#dcfce7",
      border: "#bbf7d0",
    };
  }

  if (variant === "warning") {
    return {
      icon: "!",
      title: "Needs attention",
      color: "#92400e",
      background: "#fffbeb",
      border: "#fde68a",
    };
  }

  if (variant === "info") {
    return {
      icon: "i",
      title: "Information",
      color: "#075985",
      background: "#e0f2fe",
      border: "#bae6fd",
    };
  }

  return {
    icon: "!",
    title: "Action needed",
    color: "#991b1b",
    background: "#fee2e2",
    border: "#fecaca",
  };
};

export default function FormStatusMessageRenderer(
  props: IFormStatusMessageRendererProps,
): React.ReactElement<IFormStatusMessageRendererProps> | null {
  const { variant, message, title } = props;

  if (!message || message.trim() === "") return null;

  const styles = getStatusStyles(variant);

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        color: styles.color,
        background: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: "12px",
        padding: "14px 16px",
        marginBottom: "20px",
        fontSize: "13px",
        lineHeight: 1.55,
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "999px",
          background: "#ffffff",
          color: styles.color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {styles.icon}
      </span>

      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontWeight: 800,
            marginBottom: "2px",
          }}
        >
          {title || styles.title}
        </span>
        <span style={{ display: "block" }}>{message}</span>
      </span>
    </div>
  );
}
