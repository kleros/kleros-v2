import { useQuery } from "@tanstack/react-query";

import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { isUndefined } from "utils/isUndefined";

import { graphql } from "src/graphql-generated";
import { DisputeTemplateQuery } from "src/graphql-generated/graphql";
import { isEmpty } from "utils/isEmpty";

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
  const isEnabled = !isUndefined(templateId) && !isEmpty(templateId);
  const { graphqlBatcher } = useGraphqlBatcher();

  return useQuery<DisputeTemplateQuery>({
    queryKey: [`disputeTemplate${templateId}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () =>
      await graphqlBatcher.fetch({
        id: crypto.randomUUID(),
        document: disputeTemplateQuery,
        variables: { id: templateId?.toString() },
        isDisputeTemplate: true,
      }),
  });
};
