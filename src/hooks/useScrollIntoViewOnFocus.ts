import type { FocusEvent } from "react";

/**
 * Focus handler that scrolls the focused element into the center of the
 * viewport. Intended for native `<select>` elements on dropdown-heavy pages
 * so the control stays visible after keyboard/tab focus or when navigating
 * back to a page with a long list of dropdowns.
 *
 * Usage: <select onFocus={scrollSelectIntoView} ... />
 */
export function scrollSelectIntoView(event: FocusEvent<HTMLSelectElement>) {
  event.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
}
