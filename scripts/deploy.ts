import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const UniversityCertificate = await ethers.getContractFactory("UniversityCertificate");
  const certificate = await UniversityCertificate.deploy();

  await certificate.waitForDeployment();
  
  const address = await certificate.getAddress();
  console.log("UniversityCertificate deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });