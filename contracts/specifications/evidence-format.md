# 📄 Evidence Format Specification

> Last updated: 2026-03-14 | Based on: kleros-v2 contracts @ dev branch

## 📋 Overview

This document specifies the format of evidence submissions in the Kleros V2 protocol. Evidence is submitted as a JSON-encoded string through the `Evidence` event in the `IEvidence` interface and the `EvidenceModule` contract.

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
  - Standard Value: `"Evidence"` (as used by the official frontend)
  - Purpose: Provides a consistent identifier for evidence submissions
  - Example: `"Evidence"`

> ⚠️ **Off-chain protocol requirement:** The standard value is a frontend convention, not enforced at contract level, but non-compliance breaks dispute resolution UX.

- **description** (required)

  - Type: `string`
  - Description: The main content or argument of the evidence
  - Format: Plain text or markdown content
  - Usage: Contains the substantive evidence details, arguments, or explanations
  - Example: `"This transaction was invalid because the recipient address was incorrect as shown in the attached screenshot."`

- **fileURI** (optional)
  - Type: `string`
  - Description: A URI pointing to additional evidence files
  - Format: IPFS path starting with "/ipfs/"
  - Purpose: References supporting documents, images, or other media
  - Upload: Files are uploaded via Atlas provider with SIWE authentication
  - Example: `"/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"`

## 📁 File Upload System

Evidence files are managed through the Atlas provider which provides secure, authenticated uploads to IPFS.

> ⚠️ **Off-chain protocol requirement:** File uploads happen off-chain in the frontend, not in the contracts. The EvidenceModule contract only emits events with evidence JSON.

### 1. Upload Process

The file upload follows this workflow:

1. **File Selection**: User selects file through the frontend interface
2. **Validation**: File is validated against role-based restrictions
3. **Authentication**: SIWE (Sign-In With Ethereum) authentication required
4. **Upload**: File is uploaded to IPFS via Atlas provider
5. **URI Generation**: IPFS URI is returned for inclusion in evidence

```typescript
// From SubmitEvidenceModal.tsx
const constructEvidence = async (
  uploadFile: (file: File, role: Roles) => Promise<string | null>,
  msg: string,
  file: File | undefined,
  t: (key: string) => string
) => {
  let fileURI: string | null = null;
  if (file) {
    infoToast(t("notifications.uploading_to_ipfs"));
    fileURI = await uploadFile(file, Roles.Evidence).catch((err) => {
      console.log(err);
      errorToast(t("notifications.upload_failed_error", { error: err?.message }));
      return null;
    });
    if (!fileURI) throw new Error(t("notifications.error_uploading_evidence"));
    successToast(t("notifications.uploaded_successfully"));
  }
  return { name: "Evidence", description: msg, fileURI };
};
```

### 2. Authentication Requirements

**SIWE Authentication**:
- Users must authenticate with their Ethereum wallet
- Authentication proves ownership of the submitting address
- Prevents unauthorized evidence uploads
- Maintains linkage between evidence and submitter

### 3. Role-Based Restrictions

Evidence files are uploaded under the `Roles.Evidence` role which enforces:

#### File Size Limits
- Maximum file size determined by Atlas configuration
- Limits prevent abuse and manage storage costs
- Error message includes specific size limit when exceeded

#### MIME Type Restrictions
- Only approved file types are allowed
- Common formats typically include:
  - Images: PNG, JPEG, GIF, WebP
  - Documents: PDF, TXT, DOC, DOCX
  - Archives: ZIP (for multiple files)
- Rejected files show "Unsupported file type" error

#### Validation Process
```typescript
// File validation occurs before upload
const { callback } = useFileUploader();
const msg = getFileUploaderMsg(Roles.Evidence, roleRestrictions, t);
// msg contains current restrictions and limits
```

### 4. Error Handling

**Upload Failures**:
- Network connectivity issues
- File size exceeding limits
- Unsupported file types
- Authentication failures
- IPFS storage issues

**User Feedback**:
- Progress indicators during upload
- Success confirmation with IPFS hash
- Clear error messages with specific failure reasons
- Retry mechanisms for transient failures

## 💡 Examples

### Text-Only Evidence

```json
{
  "name": "Evidence",
  "description": "The defendant failed to deliver the goods as specified in the contract. The delivery was due on March 1st, 2024, but no delivery was made as of March 15th, 2024. Multiple attempts to contact the defendant via email and phone have gone unanswered.",
  "fileURI": null
}
```

### Evidence with Supporting File

```json
{
  "name": "Evidence", 
  "description": "Screenshot showing the incorrect transaction hash provided by the respondent. The hash 0x123... does not exist on Ethereum mainnet as confirmed by Etherscan.",
  "fileURI": "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"
}
```

### Markdown-Formatted Evidence

```json
{
  "name": "Evidence",
  "description": "## Contract Violation Analysis\n\n**Issue**: Late delivery of services\n\n**Evidence**:\n1. Original contract dated January 15, 2024\n2. Delivery deadline: February 28, 2024\n3. Actual delivery: March 10, 2024\n\n**Impact**: 10-day delay caused additional costs of $500 in rush shipping.",
  "fileURI": "/ipfs/QmHash123...ContractDocument"
}
```

## 🛠️ Implementation Notes

### Frontend Integration

```typescript
// Evidence submission via EvidenceModule
const { request } = await simulateEvidenceModuleSubmitEvidence(wagmiConfig, {
  args: [BigInt(disputeId), JSON.stringify(evidenceJSON)]
});

await wrapWithToast(async () => 
  await walletClient.writeContract(request), 
  publicClient
);
```

### Event Emission

The evidence submission triggers the following event:

```solidity
event Evidence(
  uint256 indexed _arbitratorDisputeID,
  address indexed _party,
  string _evidence
);
```

**Parameters**:
- `_arbitratorDisputeID`: The dispute ID in the arbitrator contract
- `_party`: Address of the evidence submitter
- `_evidence`: The JSON-stringified evidence object

### Validation Requirements

1. **JSON Structure**: The evidence string must be valid JSON
2. **Required Fields**: Both `name` and `description` must be present and non-empty
3. **URI Format**: If provided, `fileURI` should be a valid IPFS URI
4. **Size Limits**: Total JSON size should be reasonable for blockchain storage

### Gas Considerations

- Evidence JSON is stored in event logs, not contract storage
- Larger evidence descriptions increase transaction gas costs
- Consider using IPFS for lengthy evidence and referencing via `fileURI`
- File uploads to IPFS occur off-chain and don't affect submission gas costs

## 🔗 Related Components

- `IEvidence.sol`: Interface defining the `Evidence` event structure
- `EvidenceModule.sol`: Contract implementation for evidence submission
- `SubmitEvidenceModal.tsx`: Frontend component implementing evidence creation
- `AtlasProvider`: Service handling file uploads with role-based restrictions
- IPFS: Decentralized storage system for evidence files

## 🔒 Security Considerations

1. **Authentication**: SIWE authentication ensures evidence traceability
2. **File Validation**: Role-based restrictions prevent malicious file uploads
3. **Immutability**: Evidence stored in blockchain events cannot be modified
4. **Access Control**: Only valid parties can submit evidence for a dispute
5. **Content Filtering**: File type restrictions help prevent harmful uploads
6. **Size Limits**: Upload limits prevent blockchain spam and excessive costs

## 📊 Best Practices

### For Evidence Submitters

1. **Clear Descriptions**: Write detailed, objective descriptions of the evidence
2. **Supporting Files**: Include relevant documents, screenshots, or media when available
3. **Factual Content**: Focus on verifiable facts rather than opinions
4. **Organized Structure**: Use markdown formatting for complex evidence
5. **File Management**: Ensure uploaded files are accessible and properly named

### For Developers

1. **Validation**: Always validate evidence JSON structure before submission
2. **Error Handling**: Provide clear feedback for upload failures
3. **Progress Indicators**: Show upload progress for better user experience
4. **File Management**: Implement proper file selection and preview features
5. **Security**: Validate file types and sizes before upload attempts