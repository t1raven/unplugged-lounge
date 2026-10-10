import { TextInput } from '@sanity/ui';
import {
  StringInputProps,
  set,
  unset,
} from 'sanity';

export default function InstagramInput({
  value,
  onChange,
  elementProps,
}: StringInputProps) {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.currentTarget.value;

    onChange(
      input ? set(input) : unset()
    );
  };

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    elementProps.onBlur?.(event);

    const input = event.currentTarget.value.trim();

    if (!input) {
      onChange(unset());
      return;
    }

    if (!input.startsWith('@')) {
      return;
    }

    const username = input.slice(1).trim();

    if (!username) {
      return;
    }

    onChange(
      set(`https://www.instagram.com/${username}/`)
    );
  };

  return (
    <TextInput
      {...elementProps}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}