import useSWR from "swr";

const DATAPOINT_NAMES = [
  "pnkstaked",
  "ethpaid",
  "pnkredistributed",
  "activeJurors",
  "cases",
];

export const useDataPointQuery = (): any => {
  const { data, error, isValidating } = useSWR(
    `{
      ${DATAPOINT_NAMES.map(
        (datapointName: string) => `
          ${datapointName}DataPoint(id: 0) {
            value
          }
        `
      )}
    }`
  );
  const returnData = DATAPOINT_NAMES.reduce((acc, datapointName: string) => {
    acc[datapointName] = data
      ? data[`${datapointName}DataPoint`]?.value
      : undefined;
    return acc;
  }, {});
  return { ...returnData, error, isValidating };
};
