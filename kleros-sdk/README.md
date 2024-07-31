# @kleros/kleros-v2-sdk

_Archon's successor_

To run the data mappings tests:

1. Go into the `dataMappings.test.ts` file and substitute the "insertGraphApiKeyHere" placeholder for your TheGraph graph api key, line 36. Then do the same for the "insertAlchemyApiKeyHere" variable to pass it as second parameter when calling both the callAction() and eventAction() functions, at lines 90 and 120 of the file, respectively.

2. At the root folder level, do:

```bash
yarn test
```

🚧 ⚖️ 🚧
