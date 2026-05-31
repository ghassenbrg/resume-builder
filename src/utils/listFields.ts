/**
 * Helpers for binding array fields (skills, bullets) to text inputs.
 *
 * UI convention used across the editor components:
 *  - Comma-separated single-line inputs  -> `joinComma` / `splitComma`
 *    (atomic lists such as a skill category's skills).
 *  - One-item-per-line textareas         -> `joinLines` / `splitLines`
 *    (bullet point lists).
 *
 * Bind these with `:value` + `@change` (commit on blur), NOT `v-model`, so the
 * field is not re-normalized on every keystroke (which would fight the caret).
 */

/** Join an atomic list into a comma-separated string for display. */
export function joinComma(items: string[]): string {
  return items.join(', ')
}

/** Split a comma-separated string into a trimmed, non-empty list. */
export function splitComma(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

/** Join a list into a newline-separated string (one item per line). */
export function joinLines(items: string[]): string {
  return items.join('\n')
}

/**
 * Split a textarea value into lines.
 * Empty lines are KEPT here so the user can press Enter to start a new bullet;
 * they are filtered out later by `cleanCvData` / the LaTeX generator.
 */
export function splitLines(value: string): string[] {
  return value.replace(/\r\n/g, '\n').split('\n')
}
