import { Dispatch, SetStateAction } from "react";

export type ISettings = {
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
};
