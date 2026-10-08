import React, { useState, useMemo } from "react";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Card, Searchbar } from "@kleros/ui-components-library";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { useCourtTree, rootCourtToItems, CourtTreeQuery } from "queries/useCourtTree";

import { LabeledDropdownCascader } from "components/LabeledDropdown";
import { StyledSkeleton } from "components/StyledSkeleton";

import StakeMaintenanceButtons from "../StakeMaintenanceButton";

type CourtNode = NonNullable<CourtTreeQuery["court"]>;
type FlattenedCourt = CourtNode & { parentName: string | null };

function flattenCourts(court: CourtNode, parent: CourtNode | null = null): FlattenedCourt[] {
  const current: FlattenedCourt = {
    ...court,
    parentName: parent?.name ?? null,
  };
  const children = (court.children || []).flatMap((child) => flattenCourts(child as CourtNode, current));
  return [current, ...children];
}

const TopSearch: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useCourtTree();
  const navigate = useNavigate();
  const { id: currentCourtId } = useParams();
  const items = useMemo(() => (!isUndefined(data?.court) ? [rootCourtToItems(data.court)] : false), [data]);
  const [search, setSearch] = useState("");

  const filteredCourts = useMemo(() => {
    if (!data?.court) return [];
    const courts = flattenCourts(data.court).filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));
    const selectedCourt = courts.find((c) => c.id === currentCourtId);
    if (!selectedCourt) return courts;

    return [selectedCourt, ...courts.filter((c) => c.id !== currentCourtId)];
  }, [data, search, currentCourtId]);

  return (
    <div className="w-full flex justify-between items-center gap-[8px_16px] flex-wrap">
      {items ? (
        <>
          <LabeledDropdownCascader
            ariaLabel={t("aria_labels.select_court")}
            items={items}
            callback={(item) => navigate(item.itemValue.toString())}
            placeholder={t("forms.placeholders.select_court")}
            className="w-[calc(200px_+_(240_-_200)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] [&_>_button]:w-full"
          />
          <div className="flex flex-wrap relative lg:flex-1">
            <Searchbar
              dir="auto"
              type="text"
              aria-label={t("forms.placeholders.search")}
              placeholder={t("forms.placeholders.search")}
              value={search}
              onChange={setSearch}
              className="w-full [&_input]:text-[16px]! [&_input]:h-[45px] [&_input]:pt-0 [&_input]:pb-0"
            />
            {search && filteredCourts.length > 0 && (
              <OverlayScrollbarsComponent className="absolute! mt-11.25 max-h-[400px] border border-solid border-klerosUIComponentsStroke w-full flex-col rounded-[4px] overflow-y-auto z-1 bg-klerosUIComponentsWhiteBackground [border-top-left-radius:0] [border-top-right-radius:0]">
                {filteredCourts.map((court) => (
                  <Card
                    key={court.id}
                    className={cn(
                      "[transition:0.1s] h-auto w-full py-4 cursor-pointer border-0 rounded-none hover:bg-klerosUIComponentsMediumBlue",
                      court.id === currentCourtId
                        ? "px-[13px] border-l-[3px] border-l-klerosUIComponentsPrimaryBlue bg-klerosUIComponentsMediumBlue"
                        : "px-4 bg-transparent"
                    )}
                    onClick={() => {
                      navigate(`/courts/${court.id}`);
                      setSearch("");
                    }}
                  >
                    {court.parentName && (
                      <span className="text-klerosUIComponentsSecondaryText/[0.9333]">{court.parentName} / </span>
                    )}
                    <span className="text-klerosUIComponentsPrimaryText">{court.name}</span>
                  </Card>
                ))}
              </OverlayScrollbarsComponent>
            )}
          </div>
        </>
      ) : (
        <StyledSkeleton width={240} height={42} />
      )}
      <StakeMaintenanceButtons />
    </div>
  );
};

export default TopSearch;
