import type { ComponentProps } from "react";

import { CustomTimeline, DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

/**
 * Item/prop shapes for `@kleros/ui-components-library` v3 components, derived
 * from the components themselves.
 *
 * v3 stopped exporting several of these interfaces from the package root
 * (`_TimelineItem1`, `StateProp`, the dropdown `IItem`s). Deriving them with
 * `ComponentProps` keeps us in sync with the library without reaching into its
 * internal `dist/` paths.
 */

/**
 * Item shape accepted by `CustomTimeline`. Note that v3's `CustomTimeline`
 * renders every item right-sided, so the per-item `rightSided` flag is gone.
 */
export type CustomTimelineItem = ComponentProps<typeof CustomTimeline>["items"][number];

/** Item shape accepted by `DropdownSelect` (`{ text, id, itemValue?, ... }`). */
export type SelectItem = ComponentProps<typeof DropdownSelect>["items"][number];

/** Item shape accepted by `DropdownCascader` (`{ label, itemValue, id, children? }`). */
export type CascaderItem = ComponentProps<typeof DropdownCascader>["items"][number];
