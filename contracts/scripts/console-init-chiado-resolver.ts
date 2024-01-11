// TODO: SDK utility formatDisputeExtraData(_courtId, _nbOfJurors): string
// TODO: SDK utility formatDisputeExtraData(_courtId, _nbOfJurors, disputeKitId): string

// On the foreign chain
const extraData =
  "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003";
const template = `{"$schema":"../NewDisputeTemplate.schema.json","title":"Add an entry to Ledger Contract Domain Name registry v2","description":"Someone requested to add an entry to Ledger Contract Domain Name registry v2","question":"Does the entry comply with the required criteria?","answers":[{"title":"Yes, Add It","description":"Select this if you think the entry complies with the required criteria and should be added."},{"title":"No, Don't Add It","description":"Select this if you think the entry does not comply with the required criteria and should not be added."}],"policyURI":"/ipfs/QmdvkC5Djgk8MfX5ijJR3NJzmvGugUqvui7bKuTErSD6cE/contract-domain-name-registry-for-ledger-policy-3-.pdf","frontendUrl":"https://curate.kleros.io/tcr/%s/%s/%s","arbitrableChainID":"100","arbitrableAddress":"0x957A53A994860BE4750810131d9c876b2f52d6E1","arbitratorChainID":"421614","arbitratorAddress":"0xD08Ab99480d02bf9C092828043f611BcDFEA917b","category":"Curated Lists","specification":"KIP88"}`;
const nbOfChoices = 2;
const cost = await foreignGateway.arbitrationCost(extraData);
const tx = await resolver.createDisputeForTemplate(extraData, template, "disputeTemplateMapping: TODO", nbOfChoices, {
  value: cost,
});

// Or to test the fallback to IPFS
const uri = "/ipfs/QmQ9....";
const tx2 = await resolver.createDisputeForTemplateUri(extraData, uri, nbOfChoices, { value: cost });

// Then a relayer must relay the dispute on the HomeGateway...

core = await ethers.getContract("KlerosCore");
resolver = await ethers.getContract("DisputeResolver");
extraData =
  "0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003";
template = `{"$schema":"../NewDisputeTemplate.schema.json","title":"Add an entry to Ledger Contract Domain Name registry v2","description":"Someone requested to add an entry to Ledger Contract Domain Name registry v2","question":"Does the entry comply with the required criteria?","answers":[{"title":"Yes, Add It","description":"Select this if you think the entry complies with the required criteria and should be added."},{"title":"No, Don't Add It","description":"Select this if you think the entry does not comply with the required criteria and should not be added."}],"policyURI":"/ipfs/QmdvkC5Djgk8MfX5ijJR3NJzmvGugUqvui7bKuTErSD6cE/contract-domain-name-registry-for-ledger-policy-3-.pdf","frontendUrl":"https://curate.kleros.io/tcr/%s/%s/%s","arbitrableChainID":"100","arbitrableAddress":"0x957A53A994860BE4750810131d9c876b2f52d6E1","arbitratorChainID":"421614","arbitratorAddress":"0xD08Ab99480d02bf9C092828043f611BcDFEA917b","category":"Curated Lists","specification":"KIP88"}`;
nbOfChoices = 2;
cost = await core.arbitrationCost(extraData);
tx = await resolver.createDisputeForTemplate(extraData, template, "disputeTemplateMapping: TODO", nbOfChoices, {
  value: cost,
});
