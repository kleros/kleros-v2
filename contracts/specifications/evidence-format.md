# 📄 Evidence Format Specification

## 📋 Overview

This document specifies the format of evidence submissions in the Kleros V2 protocol. Evidence is submitted as a JSON-encoded string through the `Evidence` event in the `IEvidence` interface.

## 🔧 Format

The evidence parameter must be a JSON string containing an object with the following properties:

```typescript
{
  name: string;       // The title/name of the evidence
  description: string; // The main content/description of the evidence
  fileURI?: string;   // Optional. URI pointing to additional evidence files, typically an IPFS URI
}
```

### 📝 Properties

- **name** (required)

  - Type: `string`
  - Description: A title for the evidence submission
  - Example: `"Evidence"`

- **description** (required)

  - Type: `string`
  - Description: The main content or argument of the evidence
  - Example: `"This transaction was invalid because..."`

- **fileURI** (optional)
  - Type: `string`
  - Description: A URI pointing to additional evidence files, typically an IPFS URI
  - Format: Usually an IPFS path starting with "/ipfs/"
  - Example: `"/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"`

## 📁 File Upload Restrictions

Evidence files are uploaded through the Atlas provider which enforces the following restrictions:

1. **Role-Based Restrictions**

   - Files are validated against the `evidence` role in the Atlas provider
   - Each role has specific restrictions for:
     - Maximum file size (in bytes)
     - Allowed MIME types

2. **Validation Process**

   - Files are checked for:
     - Valid MIME type against the allowed list
     - File size against the maximum allowed size
   - Validation occurs before IPFS upload
   - Failed validation results in an error with a descriptive message

3. **Error Messages**
   - "Unsupported file type" - when file MIME type is not in the allowed list
   - "File too big" - when file exceeds the maximum size limit
   - Size limit message includes the maximum allowed size in MB

## 💡 Example

```json
{
  "name": "Evidence",
  "description": "The respondent failed to deliver the agreed-upon services...",
  "fileURI": "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"
}
```

## 🛠️ Implementation Notes

1. The evidence string must be a valid JSON object when stringified
2. The `name` and `description` fields are mandatory
3. The `fileURI` field is optional and should only be included when additional files are provided
4. When submitting through the `Evidence` event, the JSON object must be stringified
5. File uploads are processed through the Atlas provider before being added to IPFS
6. File restrictions are enforced by the Atlas provider at upload time

## 🔗 Related Components

- `IEvidence.sol`: Defines the `Evidence` event that accepts this format
- `SubmitEvidenceModal.tsx`: Frontend component that constructs evidence in this format
- `AtlasProvider`: Handles file uploads with role-based restrictions

## 🔒 Security Considerations

1. The evidence data is stored off-chain, with only the JSON string being emitted in the event
2. File uploads are restricted by type and size through the Atlas provider
3. Evidence submissions are immutable once submitted to the blockchain
4. The `_party` address in the Evidence event is used to track the submitter
