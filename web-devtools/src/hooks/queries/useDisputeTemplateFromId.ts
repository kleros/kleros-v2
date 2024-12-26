import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { DEFAULT_CHAIN } from "consts/chains";
import { isUndefined } from "utils/isUndefined";

import { graphql } from "src/graphql-generated";
import { DisputeTemplateQuery } from "src/graphql-generated/graphql";

const disputeTemplateQuery = graphql(`
  query DisputeTemplate($id: ID!) {
    disputeTemplate(id: $id) {
      id
      templateTag
      templateData
      templateDataMappings
    }
  }
`);

export const useDisputeTemplateFromId = (templateId?: string) => {
  const isEnabled = !isUndefined(templateId);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DisputeTemplateQuery>({
    queryKey: [`disputeTemplate${templateId}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeTemplateQuery,
        chainId: DEFAULT_CHAIN,
        variables: { id: templateId?.toString() },
        isDisputeTemplate: true,
      }),
  });
};
