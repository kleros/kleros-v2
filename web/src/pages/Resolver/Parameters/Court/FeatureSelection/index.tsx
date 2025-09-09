import React, { Fragment, useEffect, useMemo } from "react";
import styled from "styled-components";

import { Card } from "@kleros/ui-components-library";

import {
  disputeKits,
  ensureValidSmart,
  featureGroups,
  Features,
  findMatchingKits,
  getDisabledOptions,
  getVisibleFeaturesForCourt,
  toggleFeature,
} from "consts/disputeFeature";
import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";

import { useSupportedDisputeKits } from "queries/useSupportedDisputeKits";

import { isUndefined } from "src/utils";

import { FeatureUIs } from "components/DisputeFeatures/Features";
import { GroupsUI } from "components/DisputeFeatures/GroupsUI";

import FeatureSkeleton from "./FeatureSkeleton";

const Container = styled(Card)`
  width: 100%;
  height: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryBlue};
  padding: 0;
  margin: 0;
`;

const Separator = styled.hr`
  width: 100%;
`;
const FeatureSelection: React.FC = () => {
  const {
    disputeData,
    setDisputeData,
    selectedFeatures: selected,
    setSelectedFeatures: setSelected,
  } = useNewDisputeContext();
  const { data: supportedDisputeKits } = useSupportedDisputeKits(disputeData.courtId);

  // DEV: initial feature selection logic, included hardcoded logic
  useEffect(() => {
    if (!isUndefined(disputeData?.disputeKitId)) {
      const defaultKit = disputeKits.find((dk) => dk.id === disputeData.disputeKitId);
      if (!defaultKit) return;

      // some kits like gated can have two feature sets, one for gatedERC20 and other for ERC1155
      if (defaultKit?.featureSets.length > 1) {
        if ((disputeData?.disputeKitData as IGatedDisputeData)?.isERC1155) {
          // defaultKit.featureSets[0][0] - is either Classic or Shutter
          setSelected([defaultKit.featureSets[0][0], Features.GatedErc1155]);
        } else {
          setSelected([defaultKit.featureSets[0][0], Features.GatedErc20]);
        }
      } else if (defaultKit.featureSets.length === 1) {
        setSelected(defaultKit.featureSets[0]);
      }
    }
  }, []);

  const allowedDisputeKits = useMemo(() => {
    if (!supportedDisputeKits?.court?.supportedDisputeKits) return [];
    const allowedIds = supportedDisputeKits.court.supportedDisputeKits.map((dk) => Number(dk.id));
    return disputeKits.filter((kit) => allowedIds.includes(kit.id));
  }, [supportedDisputeKits]);

  // Court specific groups
  const courtGroups = useMemo(() => {
    const courtKits = supportedDisputeKits?.court?.supportedDisputeKits.map((dk) => Number(dk.id));
    if (isUndefined(courtKits) || allowedDisputeKits.length === 0) return {};
    return getVisibleFeaturesForCourt(courtKits, allowedDisputeKits, featureGroups);
  }, [supportedDisputeKits, allowedDisputeKits]);

  const disabled = useMemo(
    () => getDisabledOptions(selected, courtGroups, allowedDisputeKits),
    [selected, courtGroups, allowedDisputeKits]
  );

  const matchingKits = useMemo(() => findMatchingKits(selected, allowedDisputeKits), [selected, allowedDisputeKits]);

  const handleToggle = (feature: Features) => {
    setSelected((prev) => {
      const toggled = toggleFeature(prev, feature, courtGroups);
      // we don't necessarily need ensureValidSmart here,
      // but in case a bug allows picking a disabled option, this will correct that
      return ensureValidSmart(toggled, courtGroups, allowedDisputeKits);
    });
  };

  // if each group only has one feature, select them by default
  // This should not clash with the initial selection logic,
  // as it only runs when there's one disputeKit and featureSet to pick
  useEffect(() => {
    // if only one disputeKit is found, and that dk has only one featureSEt to pick, then select by default
    if (allowedDisputeKits.length === 1 && allowedDisputeKits[0].featureSets.length === 1) {
      setSelected(allowedDisputeKits[0].featureSets[0]);
    }
  }, [allowedDisputeKits, setSelected]);

  useEffect(() => {
    // work of feature selection ends here by giving us the disputeKitId,
    // any further checks we do separately, like for NextButton
    // right now we don't have kits that can have same features, so we assume it will be 1 length array
    if (matchingKits.length === 1) {
      const selectedKit = matchingKits[0];

      setDisputeData({
        ...disputeData,
        disputeKitId: selectedKit.id,
        disputeKitData:
          selectedKit.type === "general"
            ? undefined
            : ({ ...disputeData.disputeKitData, type: selectedKit.type } as IGatedDisputeData),
      });
    } else if (matchingKits.length === 0) {
      setDisputeData({ ...disputeData, disputeKitId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingKits]);

  return (
    <Container>
      <SubTitle>Additional features available in this court:</SubTitle>

      {Object.entries(courtGroups).length > 0 ? (
        Object.entries(courtGroups).map(([groupName, features], index) => (
          <>
            {GroupsUI[groupName]({
              children: (
                <Fragment key={groupName}>
                  {features.map((feature) =>
                    FeatureUIs[feature]({
                      name: groupName,
                      checked: selected.includes(feature),
                      disabled: disabled.has(feature),
                      onClick: () => handleToggle(feature),
                      value: feature,
                    })
                  )}
                </Fragment>
              ),
            })}
            {index !== Object.entries(courtGroups).length - 1 ? <Separator /> : null}
          </>
        ))
      ) : (
        <FeatureSkeleton />
      )}
    </Container>
  );
};

export default FeatureSelection;
