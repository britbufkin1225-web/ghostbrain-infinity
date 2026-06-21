interface PlaceholderButtonProps {
  children: string;
}

export function PlaceholderButton({ children }: PlaceholderButtonProps) {
  return (
    <button className="placeholder-button" type="button" disabled>
      {children}
    </button>
  );
}
