// src/api/contract.ts
import { ethers } from 'ethers';
import contractABI from './UniversityCertificate.json';

export class CertificateAPI {
    private contract: ethers.Contract;
    private provider: ethers.Provider;
    
    constructor(
        contractAddress: string,
        providerUrl: string = 'https://sepolia.base.org'
    ) {
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    }

    // University Functions
    async addUniversity(universityAddress: string, signer: ethers.Signer) {
        const contractWithSigner = this.contract.connect(signer);
        const tx = await contractWithSigner.addUniversity(universityAddress);
        return await tx.wait();
    }

    async mintCertificate(
        studentAddress: string,
        ipfsHash: string,
        signer: ethers.Signer
    ) {
        const contractWithSigner = this.contract.connect(signer);
        const tx = await contractWithSigner.mintCertificate(studentAddress, ipfsHash);
        return await tx.wait();
    }

    // View Functions
    async getCertificate(tokenId: number) {
        return await this.contract.getCertificate(tokenId);
    }

    async getStudentCertificates(studentAddress: string) {
        return await this.contract.getStudentCertificates(studentAddress);
    }

    // Role Checking
    async isUniversity(address: string) {
        const UNIVERSITY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNIVERSITY_ROLE"));
        return await this.contract.hasRole(UNIVERSITY_ROLE, address);
    }
}