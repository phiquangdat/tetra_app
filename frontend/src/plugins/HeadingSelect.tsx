export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HEADING_OPTIONS: { value: BlockType; label: string }[] = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
];

interface HeadingSelectProps {
  value: BlockType;
  onChange: (value: BlockType) => void;
}

export function HeadingSelect({ value, onChange }: HeadingSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BlockType)}
      className="text-sm border border-gray-300 rounded p-1 bg-white"
      aria-label="Block type"
    >
      {HEADING_OPTIONS.map(({ value: optionValue, label }) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}
