import { z } from "zod";
import { CdpTool, CdpToolkit } from "@coinbase/cdp-langchain";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { ChatOpenAI } from "@langchain/openai";

// Define verification prompt as constant
const VERIFY_CERTIFICATE_PROMPT = `
This tool validates university certificates by:
1. Extracting text from scanned certificates
2. Validating university and degree information
3. Checking against expected format
4. Preparing for on-chain minting
`;

// Define proper interface for result
interface VerificationResult {
    isValid: boolean;
    confidence: number;
    extractedData: {
        universityName: string;
        degreeName: string;
        dateIssued: string;
    };
    errors: string[];  // Initialize as empty array instead of undefined
}

// Input schema
const VerifyCertificateInput = z.object({
    imageData: z.string().describe("Base64 encoded certificate image"),
    universityName: z.string().describe("Issuing university name"),
    expectedDegree: z.string().describe("Degree type"),
    studentAddress: z.string().describe("Student's wallet address"),
    certificateHash: z.string().describe("Original certificate hash")
});

// OCR function without tesseract direct usage
async function performOCR(imageData: string): Promise<string> {
    // Mockup for hackathon - replace with actual OCR
    return "Sample extracted text for testing";
}

// Main verification function with proper error handling
async function verifyCertificate(
    agentkit: any,
    args: z.infer<typeof VerifyCertificateInput>
): Promise<string> {
    try {
        const result: VerificationResult = {
            isValid: true,
            confidence: 0,
            extractedData: {
                universityName: '',
                degreeName: '',
                dateIssued: ''
            },
            errors: []  // Initialize as empty array
        };

        const extractedText = await performOCR(args.imageData);

        // Validation checks
        if (!extractedText.toLowerCase().includes(args.universityName.toLowerCase())) {
            result.errors.push("University name mismatch");
            result.isValid = false;
        }

        if (!extractedText.toLowerCase().includes(args.expectedDegree.toLowerCase())) {
            result.errors.push("Degree type mismatch");
            result.isValid = false;
        }

        if (result.isValid) {
            try {
                const contract = await agentkit.getContract(
                    process.env.CONTRACT_ADDRESS,
                    "UniversityCertificate"
                );

                await contract.mintScannedCertificate(
                    args.studentAddress,
                    args.certificateHash,
                    extractedText
                );

                return "Certificate verified successfully and ready for minting!";
            } catch (contractError: any) {
                return `Contract interaction failed: ${contractError.message}`;
            }
        }

        return `Certificate verification failed: ${result.errors.join(", ")}`;

    } catch (error: any) {
        return `Verification error: ${error.message}`;
    }
}

export function createVerificationTool(agentkit: CdpAgentkit): CdpTool<typeof VerifyCertificateInput> {
    return new CdpTool<typeof VerifyCertificateInput>(
        {
            name: "verify_certificate",
            description: VERIFY_CERTIFICATE_PROMPT,
            argsSchema: VerifyCertificateInput,
            func: verifyCertificate
        },
        agentkit  // Pass the required agentkit instance
    );
}
