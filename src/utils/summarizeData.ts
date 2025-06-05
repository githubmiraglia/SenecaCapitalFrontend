import _ from "lodash";

export type AggregationType = "sum" | "count" | "avg" | "min" | "max";

/**
 * Groups and summarizes data for charting.
 * @param data - Array of records.
 * @param groupByKey - Field to group by (X axis).
 * @param valueKey - Field to aggregate (Y axis).
 * @param aggType - Aggregation type.
 */
export function summarizeData(
  data: Record<string, any>[],
  groupByKey: string,
  valueKey: string,
  aggType: AggregationType
): { group: string; value: number }[] {
  const grouped = _.groupBy(data, groupByKey);

  return Object.entries(grouped).map(([group, rows]) => {
    let value: number;

    switch (aggType) {
      case "sum":
        value = _.sumBy(rows, valueKey);
        break;
      case "count":
        value = rows.length;
        break;
      case "avg":
        value = _.meanBy(rows, valueKey);
        break;
      case "min":
        value = _.minBy(rows, valueKey)?.[valueKey] ?? 0;
        break;
      case "max":
        value = _.maxBy(rows, valueKey)?.[valueKey] ?? 0;
        break;
      default:
        value = 0;
    }

    return { group, value };
  });
}
