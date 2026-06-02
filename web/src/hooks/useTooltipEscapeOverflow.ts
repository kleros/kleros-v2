import { useEffect } from "react";

const TOOLTIP_GAP = 8;

/**
 * Global observer that fixes EthID ProfileTooltip clipping inside scroll
 * containers. When a tooltip becomes visible inside an overflow ancestor,
 * it repositions it with position:fixed relative to the trigger element
 * so it escapes the overflow boundary. A ResizeObserver keeps the position
 * updated when the tooltip's dimensions change (e.g. loading → loaded).
 */
export const useTooltipEscapeOverflow = () => {
  useEffect(() => {
    const resizeObservers = new Map<HTMLElement, ResizeObserver>();

    const hasOverflowAncestor = (el: HTMLElement): boolean => {
      let parent = el.parentElement;
      while (parent) {
        const ov = getComputedStyle(parent).overflowY;
        if (ov === "hidden" || ov === "auto" || ov === "scroll") return true;
        parent = parent.parentElement;
      }
      return false;
    };

    const positionTooltip = (tooltip: HTMLElement) => {
      const wrapper = tooltip.closest(".tooltip-wrapper");
      const trigger = wrapper?.querySelector(".tooltip-child") as HTMLElement | null;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      const spaceAbove = triggerRect.top;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const goAbove = spaceAbove >= tooltipHeight + TOOLTIP_GAP || spaceAbove > spaceBelow;

      const top = goAbove ? triggerRect.top - tooltipHeight - TOOLTIP_GAP : triggerRect.bottom + TOOLTIP_GAP;

      // Left-align with trigger, clamped to viewport
      let left = triggerRect.left;
      left = Math.max(4, Math.min(left, window.innerWidth - tooltipWidth - 4));

      tooltip.style.position = "fixed";
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      tooltip.style.bottom = "auto";
      tooltip.style.right = "auto";
      tooltip.dataset.escapedOverflow = "true";
    };

    const startResizeObserver = (tooltip: HTMLElement) => {
      if (resizeObservers.has(tooltip)) return;
      const ro = new ResizeObserver(() => {
        if (tooltip.classList.contains("profile-tooltip--visible") && tooltip.dataset.escapedOverflow) {
          positionTooltip(tooltip);
        }
      });
      ro.observe(tooltip);
      resizeObservers.set(tooltip, ro);
    };

    const stopResizeObserver = (tooltip: HTMLElement) => {
      const ro = resizeObservers.get(tooltip);
      if (ro) {
        ro.disconnect();
        resizeObservers.delete(tooltip);
      }
    };

    const cleanupStyles = (el: HTMLElement) => {
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.bottom = "";
      el.style.right = "";
      delete el.dataset.escapedOverflow;
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") continue;

        const el = mutation.target as HTMLElement;
        if (!el.classList.contains("profile-tooltip-content")) continue;

        const isVisible = el.classList.contains("profile-tooltip--visible");

        if (isVisible && hasOverflowAncestor(el)) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (el.classList.contains("profile-tooltip--visible")) {
                positionTooltip(el);
                startResizeObserver(el);
              }
            });
          });
        } else if (el.dataset.escapedOverflow) {
          stopResizeObserver(el);
          setTimeout(() => {
            if (!el.classList.contains("profile-tooltip--visible")) {
              cleanupStyles(el);
            }
          }, 250);
        }
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true,
    });

    return () => {
      observer.disconnect();
      resizeObservers.forEach((ro) => ro.disconnect());
      resizeObservers.clear();
    };
  }, []);
};
