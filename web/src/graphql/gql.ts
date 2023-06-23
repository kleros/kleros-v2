/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query CasesPage($skip: Int) {\n    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {\n      id\n      arbitrated {\n        id\n      }\n      court {\n        id\n        policy\n        feeForJuror\n        timesPerPeriod\n      }\n      period\n      lastPeriodChange\n    }\n    counter(id: "0") {\n      cases\n    }\n  }\n':
    types.CasesPageDocument,
  "\n  query ClassicAppeal($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n      }\n      arbitrated {\n        id\n      }\n      lastPeriodChange\n      disputeKitDispute {\n        id\n        currentLocalRoundIndex\n        localRounds {\n          ... on ClassicRound {\n            winningChoice\n            paidFees\n            fundedChoices\n          }\n        }\n      }\n    }\n  }\n":
    types.ClassicAppealDocument,
  "\n  query CourtDetails($id: ID!) {\n    court(id: $id) {\n      policy\n      minStake\n      alpha\n      numberDisputes\n      numberStakedJurors\n      stake\n      paidETH\n      paidPNK\n    }\n  }\n":
    types.CourtDetailsDocument,
  "\n  query CourtPolicyURI($courtID: ID!) {\n    court(id: $courtID) {\n      policy\n    }\n  }\n":
    types.CourtPolicyUriDocument,
  '\n  query CourtTree {\n    court(id: "1") {\n      name\n      id\n      children(orderBy: name) {\n        name\n        id\n        children {\n          name\n          id\n          children {\n            name\n            id\n            children {\n              name\n              id\n              children {\n                name\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.CourtTreeDocument,
  "\n  query DisputeDetails($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n        hiddenVotes\n        feeForJuror\n      }\n      arbitrated {\n        id\n      }\n      period\n      ruled\n      lastPeriodChange\n    }\n  }\n":
    types.DisputeDetailsDocument,
  "\n  query Draw($address: String, $disputeID: String) {\n    draws(where: { dispute: $disputeID, juror: $address }) {\n      voteID\n    }\n  }\n":
    types.DrawDocument,
  "\n  query Evidences($evidenceGroup: String) {\n    evidences(where: { evidenceGroup: $evidenceGroup }, orderBy: id, orderDirection: asc) {\n      id\n      evidence\n      sender {\n        id\n      }\n    }\n  }\n":
    types.EvidencesDocument,
  "\n  query HomePage($timeframe: ID) {\n    disputes(first: 3) {\n      id\n    }\n    counters(where: { id_gt: $timeframe }) {\n      id\n      stakedPNK\n      paidETH\n      redistributedPNK\n      activeJurors\n      cases\n    }\n  }\n":
    types.HomePageDocument,
  "\n  query VotingHistory($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      id\n      rounds {\n        nbVotes\n      }\n      disputeKitDispute {\n        localRounds {\n          ... on ClassicRound {\n            totalVoted\n            votes {\n              id\n              juror {\n                id\n              }\n              ... on ClassicVote {\n                choice\n                justification\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.VotingHistoryDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CasesPage($skip: Int) {\n    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {\n      id\n      arbitrated {\n        id\n      }\n      court {\n        id\n        policy\n        feeForJuror\n        timesPerPeriod\n      }\n      period\n      lastPeriodChange\n    }\n    counter(id: "0") {\n      cases\n    }\n  }\n'
): (typeof documents)['\n  query CasesPage($skip: Int) {\n    disputes(first: 3, skip: $skip, orderBy: lastPeriodChange, orderDirection: desc) {\n      id\n      arbitrated {\n        id\n      }\n      court {\n        id\n        policy\n        feeForJuror\n        timesPerPeriod\n      }\n      period\n      lastPeriodChange\n    }\n    counter(id: "0") {\n      cases\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query ClassicAppeal($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n      }\n      arbitrated {\n        id\n      }\n      lastPeriodChange\n      disputeKitDispute {\n        id\n        currentLocalRoundIndex\n        localRounds {\n          ... on ClassicRound {\n            winningChoice\n            paidFees\n            fundedChoices\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query ClassicAppeal($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n      }\n      arbitrated {\n        id\n      }\n      lastPeriodChange\n      disputeKitDispute {\n        id\n        currentLocalRoundIndex\n        localRounds {\n          ... on ClassicRound {\n            winningChoice\n            paidFees\n            fundedChoices\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query CourtDetails($id: ID!) {\n    court(id: $id) {\n      policy\n      minStake\n      alpha\n      numberDisputes\n      numberStakedJurors\n      stake\n      paidETH\n      paidPNK\n    }\n  }\n"
): (typeof documents)["\n  query CourtDetails($id: ID!) {\n    court(id: $id) {\n      policy\n      minStake\n      alpha\n      numberDisputes\n      numberStakedJurors\n      stake\n      paidETH\n      paidPNK\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query CourtPolicyURI($courtID: ID!) {\n    court(id: $courtID) {\n      policy\n    }\n  }\n"
): (typeof documents)["\n  query CourtPolicyURI($courtID: ID!) {\n    court(id: $courtID) {\n      policy\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CourtTree {\n    court(id: "1") {\n      name\n      id\n      children(orderBy: name) {\n        name\n        id\n        children {\n          name\n          id\n          children {\n            name\n            id\n            children {\n              name\n              id\n              children {\n                name\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query CourtTree {\n    court(id: "1") {\n      name\n      id\n      children(orderBy: name) {\n        name\n        id\n        children {\n          name\n          id\n          children {\n            name\n            id\n            children {\n              name\n              id\n              children {\n                name\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query DisputeDetails($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n        hiddenVotes\n        feeForJuror\n      }\n      arbitrated {\n        id\n      }\n      period\n      ruled\n      lastPeriodChange\n    }\n  }\n"
): (typeof documents)["\n  query DisputeDetails($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      court {\n        id\n        timesPerPeriod\n        hiddenVotes\n        feeForJuror\n      }\n      arbitrated {\n        id\n      }\n      period\n      ruled\n      lastPeriodChange\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Draw($address: String, $disputeID: String) {\n    draws(where: { dispute: $disputeID, juror: $address }) {\n      voteID\n    }\n  }\n"
): (typeof documents)["\n  query Draw($address: String, $disputeID: String) {\n    draws(where: { dispute: $disputeID, juror: $address }) {\n      voteID\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query Evidences($evidenceGroup: String) {\n    evidences(where: { evidenceGroup: $evidenceGroup }, orderBy: id, orderDirection: asc) {\n      id\n      evidence\n      sender {\n        id\n      }\n    }\n  }\n"
): (typeof documents)["\n  query Evidences($evidenceGroup: String) {\n    evidences(where: { evidenceGroup: $evidenceGroup }, orderBy: id, orderDirection: asc) {\n      id\n      evidence\n      sender {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query HomePage($timeframe: ID) {\n    disputes(first: 3) {\n      id\n    }\n    counters(where: { id_gt: $timeframe }) {\n      id\n      stakedPNK\n      paidETH\n      redistributedPNK\n      activeJurors\n      cases\n    }\n  }\n"
): (typeof documents)["\n  query HomePage($timeframe: ID) {\n    disputes(first: 3) {\n      id\n    }\n    counters(where: { id_gt: $timeframe }) {\n      id\n      stakedPNK\n      paidETH\n      redistributedPNK\n      activeJurors\n      cases\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query VotingHistory($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      id\n      rounds {\n        nbVotes\n      }\n      disputeKitDispute {\n        localRounds {\n          ... on ClassicRound {\n            totalVoted\n            votes {\n              id\n              juror {\n                id\n              }\n              ... on ClassicVote {\n                choice\n                justification\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query VotingHistory($disputeID: ID!) {\n    dispute(id: $disputeID) {\n      id\n      rounds {\n        nbVotes\n      }\n      disputeKitDispute {\n        localRounds {\n          ... on ClassicRound {\n            totalVoted\n            votes {\n              id\n              juror {\n                id\n              }\n              ... on ClassicVote {\n                choice\n                justification\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
