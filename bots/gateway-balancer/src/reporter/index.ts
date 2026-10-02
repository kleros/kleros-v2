import type { CreateReporterLoops } from "../ports";

/** Reporter lane: one funding loop per reporter route, independent of the HomeGateway refills. */
export const createReporterLoops: CreateReporterLoops = () => [];
