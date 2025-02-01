import { expect } from "chai";
import { ethers } from "hardhat";
import { UniversityCertificate } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UniversityCertificate", function () {
    let certificateContract: UniversityCertificate;
    let owner: SignerWithAddress;
    let university: SignerWithAddress;
    let verifier: SignerWithAddress;
    let student: SignerWithAddress;
    let other: SignerWithAddress;

    const UNIVERSITY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNIVERSITY_ROLE"));
    const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

    beforeEach(async function () {
        // Get signers
        [owner, university, verifier, student, other] = await ethers.getSigners();

        // Deploy contract
        const Certificate = await ethers.getContractFactory("UniversityCertificate");
        certificateContract = await Certificate.deploy();

        // Setup roles
        await certificateContract.addUniversity(university.address);
        await certificateContract.addVerifier(verifier.address);
    });

    describe("Deployment & Roles", function () {
        it("Should set the right owner", async function () {
            expect(await certificateContract.hasRole(await certificateContract.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
        });

        it("Should assign university role correctly", async function () {
            expect(await certificateContract.hasRole(UNIVERSITY_ROLE, university.address)).to.be.true;
        });
    });

    describe("Certificate Minting", function () {
        const ipfsHash = "QmTest";

        it("Should allow university to mint certificate", async function () {
            await expect(certificateContract.connect(university).mintCertificate(
                student.address, 
                ipfsHash
            )).to.not.be.reverted;
        });

        it("Should not allow non-university to mint", async function () {
            await expect(certificateContract.connect(other).mintCertificate(
                student.address, 
                ipfsHash
            )).to.be.reverted;
        });

        it("Should emit correct events on mint", async function () {
            await expect(certificateContract.connect(university).mintCertificate(
                student.address, 
                ipfsHash
            )).to.emit(certificateContract, "CertificateIssued");
        });
    });

    describe("Soulbound Behavior", function () {
        it("Should prevent transfer of token", async function () {
            await certificateContract.connect(university).mintCertificate(
                student.address, 
                "QmTest"
            );

            await expect(
                certificateContract.connect(student).transferFrom(
                    student.address,
                    other.address,
                    0
                )
            ).to.be.revertedWith("Soulbound: Transfer not allowed");
        });
    });

    describe("Scanned Certificates", function () {
        const ipfsHash = "QmTest";
        const scanHash = "ScanTest";

        it("Should allow verifier to mint scanned certificate", async function () {
            await expect(certificateContract.connect(verifier).mintScannedCertificate(
                student.address,
                ipfsHash,
                scanHash
            )).to.not.be.reverted;
        });

        it("Should prevent duplicate scan hash usage", async function () {
            await certificateContract.connect(verifier).mintScannedCertificate(
                student.address,
                ipfsHash,
                scanHash
            );

            await expect(certificateContract.connect(verifier).mintScannedCertificate(
                student.address,
                ipfsHash,
                scanHash
            )).to.be.revertedWith("Scan already used");
        });
    });
});