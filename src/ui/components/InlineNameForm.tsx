import { Check, X } from "lucide-react";
import type { FormEvent } from "react";

interface InlineNameFormProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  className?: string;
}

export function InlineNameForm({ value, placeholder, onChange, onSubmit, onCancel, className = "create-inline" }: InlineNameFormProps) {
  return <form className={className} onSubmit={onSubmit}>
    <input autoFocus value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} onKeyDown={(event) => { if (event.key === "Escape") onCancel(); }} />
    <button aria-label="Save"><Check size={13} /></button>
    <button type="button" aria-label="Cancel" onClick={onCancel}><X size={13} /></button>
  </form>;
}
