import { ethers } from "hardhat";
import { UniversityCertificate } from "../typechain-types/contracts/interfaces/UniversityCertificate.ts;
import { UniversityCertificate__factory } from "../typechain-types/factories/contracts/UniversityCertificate__factory";

async function main() {
    const CONTRACT_ADDRESS = "0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789";
    
    try {
        // Get Contract Factory with types
        const UniversityCertificateFactory: UniversityCertificate__factory = await ethers.getContractFactory("UniversityCertificate");
        const contract: UniversityCertificate = UniversityCertificateFactory.attach(CONTRACT_ADDRESS) as UniversityCertificate;

        // Get signers
        const [admin, university, student] = await ethers.getSigners();
        console.log("Admin address:", admin.address);
        console.log("University address:", university.address);
        console.log("Student address:", student.address);

        // Add University Role
        console.log("\nAdding university role...");
        const UNIVERSITY_ROLE = await contract.UNIVERSITY_ROLE();
        const addUniversityTx = await contract.connect(admin).grantRole(UNIVERSITY_ROLE, university.address);
        await addUniversityTx.wait();
        console.log("University role added!");

        // Mint Certificate
        console.log("\nMinting certificate...");
        const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("First Certificate"));
        const mintTx = await contract.connect(university).mintCertificate(
            student.address,
            certificateHash
        );
        await mintTx.wait();
        console.log("Certificate minted!");

        // Verify Certificate
        console.log("\nVerifying certificate...");
        const certificate = await contract.certificates(0); // Using mapping directly
        console.log("Certificate details:", {
            ipfsHash: certificate.ipfsHash,
            university: certificate.university,
            isValid: certificate.isValid,
            issueDate: new Date(Number(certificate.issueDate) * 1000).toLocaleString(),
            isVerified: certificate.isVerified
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });