import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  eyebrow?: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export function Panel({ title, eyebrow, description, children, className = "" }: PanelProps) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="panel__header">
        {eyebrow ? <span className="panel__eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children ? <div className="panel__body">{children}</div> : null}
    </section>
  );
}
