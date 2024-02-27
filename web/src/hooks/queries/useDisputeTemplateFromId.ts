import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "utils/index";
import { useGraphqlBatcher } from "context/GraphqlBatcher";
import { DisputeTemplateQuery } from "src/graphql/graphql";

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
        variables: { id: templateId?.toString() },
        isDisputeTemplate: true,
      }),
  });
};
