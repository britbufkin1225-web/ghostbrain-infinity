interface StateBlockProps {
  title: string;
  description: string;
  state: "empty" | "loading" | "error";
}

export function StateBlock({ title, description, state }: StateBlockProps) {
  return (
    <div className={`state-block state-block--${state}`}>
      <span>{state}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
