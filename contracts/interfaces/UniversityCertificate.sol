// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/IERC5192.sol";

/// @title University Certificate SBT Contract
contract UniversityCertificate is ERC721, AccessControl, IERC5192 {
   uint256 private _nextTokenId;
   
   // Roles for access control
   bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");
   bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

   // Certificate data structure
   struct Certificate {
       string ipfsHash;              // Certificate data on IPFS
       address university;           // Issuing university
       bool isValid;                 // Current status
       uint256 issueDate;           // Issue timestamp
       bool isPhysicalScan;         // Physical scan flag
       string scanVerificationHash;  // Scan verification data
       bool isVerified;             // Verification status
   }

   // Main storage mappings
   mapping(uint256 => Certificate) public certificates;
   mapping(uint256 => bool) private _locked;
   mapping(string => bool) private _usedScans;

   // Events for frontend tracking
   event CertificateIssued(uint256 indexed tokenId, address indexed student, address indexed university);
   event CertificateRevoked(uint256 indexed tokenId, address indexed university);
   event ScannedCertificateSubmitted(uint256 indexed tokenId, address indexed student);
   event ScannedCertificateVerified(uint256 indexed tokenId, address indexed verifier);

   constructor() ERC721("UniversityCertificate", "UCERT") {
       _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
   }

   // Interface support check
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return 
            interfaceId == type(IERC5192).interfaceId || 
            super.supportsInterface(interfaceId);
    }

   // Role management functions
   function addUniversity(address university) external onlyRole(DEFAULT_ADMIN_ROLE) {
       grantRole(UNIVERSITY_ROLE, university);
   }

   function addVerifier(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
       grantRole(VERIFIER_ROLE, verifier);
   }

   // Certificate minting for universities
   function mintCertificate(address student, string memory ipfsHash) 
       external 
       onlyRole(UNIVERSITY_ROLE) 
   {
       require(student != address(0), "Invalid student address");
       require(bytes(ipfsHash).length > 0, "Empty IPFS hash");

       uint256 tokenId = _nextTokenId++;
       
       certificates[tokenId] = Certificate({
           ipfsHash: ipfsHash,
           university: msg.sender,
           isValid: true,
           issueDate: block.timestamp,
           isPhysicalScan: false,
           scanVerificationHash: "",
           isVerified: true
       });

       _mint(student, tokenId);
       _locked[tokenId] = true;
       
       emit Locked(tokenId);
       emit CertificateIssued(tokenId, student, msg.sender);
   }

   // Scanned certificate minting
   function mintScannedCertificate(
       address student,
       string memory ipfsHash,
       string memory scanHash
   ) external onlyRole(VERIFIER_ROLE) {
       require(!_usedScans[scanHash], "Scan already used");
       
       uint256 tokenId = _nextTokenId++;
       
       certificates[tokenId] = Certificate({
           ipfsHash: ipfsHash,
           university: msg.sender,
           isValid: true,
           issueDate: block.timestamp,
           isPhysicalScan: true,
           scanVerificationHash: scanHash,
           isVerified: false
       });

       _usedScans[scanHash] = true;
       _mint(student, tokenId);
       _locked[tokenId] = true;
       
       emit Locked(tokenId);
       emit ScannedCertificateSubmitted(tokenId, student);
   }

   // Verification functions
   function verifyCertificate(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
       require(_exists(tokenId), "Certificate does not exist");
       require(certificates[tokenId].isPhysicalScan, "Not a scanned certificate");
       require(!certificates[tokenId].isVerified, "Already verified");
       
       certificates[tokenId].isVerified = true;
       emit ScannedCertificateVerified(tokenId, msg.sender);
   }

   // Revocation function
   function revokeCertificate(uint256 tokenId) external {
       require(_exists(tokenId), "Certificate does not exist");
       require(
           msg.sender == certificates[tokenId].university || 
           hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
           "Not authorized"
       );
       
       certificates[tokenId].isValid = false;
       emit CertificateRevoked(tokenId, msg.sender);
   }

   // View functions for frontend
   function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
       require(_exists(tokenId), "Certificate does not exist");
       return certificates[tokenId];
   }

   function getStudentCertificates(address student) external view returns (uint256[] memory) {
       uint256 balance = balanceOf(student);
       uint256[] memory tokenIds = new uint256[](balance);
       uint256 counter = 0;
       
       for(uint256 i = 0; i < _nextTokenId; i++) {
           if(_exists(i) && ownerOf(i) == student) {
               tokenIds[counter] = i;
               counter++;
           }
       }
       return tokenIds;
   }

   // Soulbound implementation
   function locked(uint256 tokenId) external view override returns (bool) {
       require(_exists(tokenId), "Token does not exist");
       return _locked[tokenId];
   }

   function _exists(uint256 tokenId) internal view returns (bool) {
       return _ownerOf(tokenId) != address(0);
   }

   // Prevent transfers
   //check if its correct
   function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId); // Fetch the current owner

        // Enforce soulbound restriction: Only minting (from == address(0)) or burning (to == address(0)) is allowed
        require(from == address(0) || to == address(0), "Soulbound: Transfer not allowed");

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(from, auth, tokenId);
        }

        // Clear approval if the token is being burned
        if (from != address(0)) {
            _approve(address(0), tokenId, address(0), false);
        }

        return super._update(to, tokenId, auth);
    }

}