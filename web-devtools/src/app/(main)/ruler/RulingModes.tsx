import React, { useState } from "react";
import styled from "styled-components";

import { RULING_MODE } from "consts";

import { Button, Radio } from "@kleros/ui-components-library";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SelectContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 16px;
`;

const AutomaticPresetInputsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const RulingModes: React.FC = () => {
  const [tie, setTie] = useState<boolean>(false);
  const [overriden, setOverriden] = useState<boolean>(false);
  const [ruling, setRuling] = useState<number>();
  const [rulingMode, setRulingMode] = useState<RULING_MODE | null>(null);

  return (
    <Container>
      <Header text="Ruling Mode" />
      <SelectContainer>
        <Radio
          small
          label="Manual"
          checked={rulingMode === RULING_MODE.Manual}
          onChange={() => {
            setRulingMode(RULING_MODE.Manual);
          }}
        />
        <Radio
          small
          label="Random Preset"
          checked={rulingMode === RULING_MODE.RandomPreset}
          onChange={() => {
            setRulingMode(RULING_MODE.RandomPreset);
          }}
        />
        <Radio
          small
          label="Automatic Preset"
          checked={rulingMode === RULING_MODE.AutomaticPreset}
          onChange={() => {
            setRulingMode(RULING_MODE.AutomaticPreset);
          }}
        />
        <AutomaticPresetInputsContainer>
          <LabeledInput
            label="Ruling"
            type="number"
            value={ruling}
            onChange={(e) => setRuling(Number(e.target.value))}
          />
          <LabeledInput label="Tie" inputType="checkbox" checked={tie} onChange={() => setTie((prev) => !prev)} />
          <LabeledInput
            label="Overidden"
            inputType="checkbox"
            checked={overriden}
            onChange={() => setOverriden((prev) => !prev)}
          />
        </AutomaticPresetInputsContainer>
      </SelectContainer>

      <Button text="Update" />
    </Container>
  );
};

export default RulingModes;
