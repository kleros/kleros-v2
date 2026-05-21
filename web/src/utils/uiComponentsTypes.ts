import type { ComponentProps } from "react";

import { CustomTimeline, DropdownCascader, DropdownSelect } from "@kleros/ui-components-library";

export type CustomTimelineItem = ComponentProps<typeof CustomTimeline>["items"][number];

export type SelectItem = ComponentProps<typeof DropdownSelect>["items"][number];

export type CascaderItem = ComponentProps<typeof DropdownCascader>["items"][number];
