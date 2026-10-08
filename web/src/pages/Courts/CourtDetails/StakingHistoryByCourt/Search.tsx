import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";

import { Searchbar } from "@kleros/ui-components-library";

import { isEmpty } from "utils/index";

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initial = searchParams.get("stakeSearch") ?? "";
  const [value, setValue] = useState(initial);
  useDebounce(
    () => {
      const params = new URLSearchParams(searchParams);
      if (isEmpty(value)) {
        params.delete("stakeSearch");
      } else {
        params.set("stakeSearch", value);
      }
      navigate(`${pathname}?${params.toString()}`, { replace: true });
    },
    500,
    [value]
  );
  return (
    <div className="w-full flex flex-wrap gap-2 mb-1.25 z-0">
      <Searchbar
        dir="auto"
        type="text"
        aria-label={t("forms.placeholders.search_by_address")}
        placeholder={t("forms.placeholders.search_by_address")}
        value={value}
        onChange={setValue}
        className="flex-1 [flex-basis:310px] [&_input]:text-[16px]! [&_input]:h-[45px] [&_input]:pt-0 [&_input]:pb-0"
      />
    </div>
  );
};

export default Search;
