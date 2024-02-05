import { graphql } from "src/graphql";
import { useQuery } from "@tanstack/react-query";
import { graphqlQueryFnHelper } from "utils/graphqlQueryFnHelper";
import { isUndefined } from "utils/index";
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

  return useQuery<DisputeTemplateQuery>({
    queryKey: [`disputeTemplate${templateId}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => await graphqlQueryFnHelper(disputeTemplateQuery, { id: templateId?.toString() }, true),
  });
};
