import { ethers } from "hardhat";

// Your deployed contract address
const CONTRACT_ADDRESS = "0xEC1436e5C911ae8a53066DF5E1CC79A9d8F8A789";

async function main() {
    const contract = await ethers.getContractAt("UniversityCertificate", CONTRACT_ADDRESS);
    const [deployer] = await ethers.getSigners();

    console.log("Interacting with contract:", CONTRACT_ADDRESS);

    // Add a university
    try {
        const tx = await contract.addUniversity("0xaC65d62A2b42921dd75A9e5f915bd71635B4E3B4");
        await tx.wait();
        console.log("University added successfully");
    } catch (error) {
        console.error("Error adding university:", error);
    }

    // Test if university was added
    try {
        const UNIVERSITY_ROLE = ethers.keccak256(ethers.toUtf8Bytes("UNIVERSITY_ROLE"));
        const hasRole = await contract.hasRole(UNIVERSITY_ROLE, "0xaC65d62A2b42921dd75A9e5f915bd71635B4E3B4");
        console.log("Is university added?", hasRole);
    } catch (error) {
        console.error("Error checking university role:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });