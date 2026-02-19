"""
AI-powered document analyzer for ISO 27001 compliance checking.
"""

import logging
import json
import os
import re
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# ISO 27001:2022 Checklist definitions with comprehensive requirements
ISO27001_CHECKLISTS = {
    1: {
        "id": 1,
        "title": "A.5 Information Security Policies",
        "controls": [
            "A.5.1 Policies for information security",
            "A.5.2 Information security roles and responsibilities",
            "A.5.3 Segregation of duties",
            "A.5.4 Management responsibilities",
            "A.5.5 Contact with authorities",
            "A.5.6 Contact with special interest groups",
            "A.5.7 Threat intelligence",
            "A.5.8 Information security in project management",
        ],
        "keywords": [
            "information security policy",
            "security policy",
            "policy review",
            "management commitment",
            "policy approval",
            "policy communication",
            "strategy",
            "legislation",
            "regulations",
            "contracts",
            "security objectives",
            "security principles",
        ],
        "requirements": """ISO 27001:2022 A.5 Information Security Policies Requirements:

The information security policy MUST consider the following:
1. Strategy and requirements of the business
2. Legislation, regulations, and contracts
3. Information security risks and threats that exist today and in the future

The information security policy MUST include statements concerning:
1. Information security definition - Clear definition of what information security means for the organization
2. Framework for establishing information security objectives - How objectives are set and measured
3. Information security principles that should guide all activities
4. A commitment to comply with all applicable information security requirements
5. An ongoing commitment to improving the information security management system (ISMS)
6. Role-based assignment of responsibilities for information security management
7. Procedures for handling exceptions and exemptions

ISO 27001:2022 also requires topic-specific policies for:
- Information security incident management
- Asset management
- Networking security
- Incident management
- Secure development

AUDIT CHECKLIST:
□ Does the policy align with business strategy and objectives?
□ Does it reference applicable laws, regulations, and contractual obligations?
□ Is there a clear definition of information security?
□ Are security objectives defined with a framework for measurement?
□ Are guiding principles for information security activities documented?
□ Is there a commitment statement to compliance?
□ Is there a commitment to continual improvement of the ISMS?
□ Are roles and responsibilities clearly assigned?
□ Is there a process for exceptions and exemptions?
□ Are topic-specific policies defined (incident management, asset management, network security, secure development)?
□ Is the policy approved by management?
□ Has the policy been communicated to all relevant parties?
□ Is there a scheduled review process for the policy?""",
    },
    2: {
        "id": 2,
        "title": "A.6 Organization of Information Security",
        "controls": [
            "A.6.1 Screening",
            "A.6.2 Terms and conditions of employment",
            "A.6.3 Information security awareness, education and training",
            "A.6.4 Disciplinary process",
            "A.6.5 Responsibilities after termination or change of employment",
            "A.6.6 Confidentiality or non-disclosure agreements",
            "A.6.7 Remote working",
            "A.6.8 Information security event reporting",
        ],
        "keywords": [
            "roles",
            "responsibilities",
            "segregation",
            "duties",
            "mobile device",
            "teleworking",
            "remote work",
            "project management",
            "CISO",
            "ownership",
            "information assets",
        ],
        "requirements": """ISO 27001:2022 A.6 Organization of Information Security Requirements:

All information security responsibilities MUST be defined and allocated. Responsibilities can be:
- General (e.g., protecting information)
- Specific (e.g., responsibility for granting particular permissions)

Consideration MUST be given to ownership of information assets or groups of assets.

Business roles with information security relevance include:
- Departmental heads
- Business process owners
- Facilities manager
- HR manager
- Internal Auditor
- CEO/Operations Director (may serve as CISO in smaller organizations)
- CTO (may own technology-related information assets)

The organization MUST ensure:
1. Clear definition of who is responsible for what
2. Responsibilities are proportionate to organization size and nature
3. For smaller organizations, specific information security responsibilities within existing job roles must be clarified

AUDIT CHECKLIST:
□ Are all information security responsibilities defined and documented?
□ Are responsibilities allocated to specific individuals or roles?
□ Is there an information security organizational structure?
□ Are asset owners identified for all information assets?
□ Is there clear segregation of duties where needed?
□ Are contacts with authorities established (law enforcement, regulators)?
□ Are contacts with special interest groups maintained (security forums, professional associations)?
□ Is information security integrated into project management?
□ For smaller organizations: Are security responsibilities clarified within existing job descriptions?
□ Is there a CISO or equivalent role with overarching ISMS responsibility?
□ Are responsibilities reviewed and updated when organizational changes occur?
□ Is there evidence of management commitment to information security?""",
    },
    3: {
        "id": 3,
        "title": "A.7 Human Resource Security",
        "controls": [
            "A.7.1 Screening (background checks)",
            "A.7.2 Terms and conditions of employment",
            "A.7.3 Information security awareness, education and training",
            "A.7.4 Disciplinary process",
            "A.7.5 Responsibilities after termination or change of employment",
            "A.7.6 Confidentiality or non-disclosure agreements",
            "A.7.7 Remote working",
            "A.7.8 Information security event reporting",
        ],
        "keywords": [
            "screening",
            "background check",
            "employment",
            "training",
            "awareness",
            "disciplinary",
            "termination",
            "onboarding",
            "offboarding",
            "NDA",
            "confidentiality",
            "remote working",
        ],
        "requirements": """ISO 27001:2022 A.7 Human Resource Security Requirements:

People controls span pre-employment, during employment, and post-employment phases:

PRE-EMPLOYMENT:
1. Personnel screening / background checks (A.6.1 Screening)
   - Ensures only trustworthy individuals are hired
   - Mitigates insider threats
   - Verifies suitability for sensitive roles

2. Employment contracts and confidentiality agreements (A.6.2)
   - Staff and contractors must agree to confidentiality and security obligations
   - Non-disclosure agreements (NDAs)
   - Acceptable use policies
   - Consequences of breach documented

DURING EMPLOYMENT:
3. Security awareness training and training records (A.6.3)
   - Keeps employees aware of policies
   - Reduces human error
   - Provides evidence of compliance
   - Regular updates and refresher training

4. Disciplinary and incident reporting procedures (A.6.4 and A.6.8)
   - Safe channels to report incidents or policy violations
   - Clear expectations for investigation and disciplinary action

POST-EMPLOYMENT:
5. Secure termination and change management (A.6.5)
   - Timely revocation of access
   - Return of assets
   - Preservation of confidentiality after role changes or termination

6. Confidentiality agreements (A.6.6)
   - Contractual confidentiality obligations remain binding after employment ends

REMOTE WORKING:
7. Remote working controls (A.6.7)
   - Device security requirements
   - Secure connections (VPN, encrypted communications)
   - Monitoring and logging

8. Role-based access management (supported by A.8 controls)
   - HR defines role descriptions and approves access rights
   - Least-privilege enforcement

AUDIT CHECKLIST:
□ Are background checks performed for all new hires?
□ Are background checks proportionate to job role and information access?
□ Do employment contracts include security obligations?
□ Are NDAs or confidentiality agreements signed?
□ Is there a documented acceptable use policy?
□ Is there a security awareness training program?
□ Are training records maintained?
□ Is training provided on onboarding and regularly thereafter?
□ Is there a formal disciplinary process for security violations?
□ Are there safe channels for reporting security incidents?
□ Is there a termination/offboarding process that includes access revocation?
□ Is there a process for return of company assets?
□ Do confidentiality obligations extend beyond employment?
□ Are remote working security requirements documented?
□ Is device security enforced for remote workers?
□ Are secure connections required for remote access?""",
    },
    4: {
        "id": 4,
        "title": "A.8 Asset Management",
        "controls": [
            "A.8.1 Inventory of assets",
            "A.8.2 Ownership of assets",
            "A.8.3 Acceptable use of assets",
            "A.8.4 Return of assets",
            "A.8.5 Classification of information",
            "A.8.6 Labelling of information",
            "A.8.7 Handling of assets",
            "A.8.8 Management of removable media",
            "A.8.9 Configuration management",
            "A.8.10 Information deletion",
            "A.8.11 Data masking",
            "A.8.12 Data leakage prevention",
        ],
        "keywords": [
            "asset inventory",
            "asset management",
            "classification",
            "labelling",
            "media handling",
            "removable media",
            "disposal",
            "asset ownership",
            "configuration management",
            "data masking",
            "data deletion",
            "DLP",
        ],
        "requirements": """ISO 27001:2022 A.8 Asset Management Requirements:

KEY ASPECTS OF ASSET MANAGEMENT:

1. Inventory and Identification (A.8.1)
   - Create a comprehensive list of ALL information assets
   - Include: data, software, hardware, services, people, premises
   - Maintain accuracy and currency of the inventory

2. Ownership (A.8.2)
   - Assign owners for EVERY asset
   - Owners are responsible for maintaining and protecting the asset
   - Clear accountability chain

3. Acceptable Use (A.8.3)
   - Define rules for how employees use assets (computers, data, etc.)
   - Document acceptable use policies
   - Communicate policies to all users

4. Return of Assets (A.8.4)
   - Ensure staff return company assets upon termination
   - Process for change of employment
   - Tracking and verification

5. Classification and Handling (A.8.5 - A.8.8)
   - Classify information based on confidentiality (e.g., restricted, confidential, internal, public)
   - Apply proper labeling procedures
   - Define handling procedures for each classification level

6. Media Disposal (A.8.8)
   - Safely destroy storage media to prevent data breaches
   - Documented disposal procedures
   - Verification of destruction

ISO 27001:2022 NEW CONTROLS:

7. Configuration Management (A.8.9)
   - Tracking configuration changes to hardware and software
   - Baseline configurations
   - Change management for configurations

8. Information Deletion (A.8.10)
   - Deleting information when no longer required
   - Secure deletion procedures
   - Retention policy compliance

9. Data Masking (A.8.11)
   - Using masking for sensitive data
   - Test data management
   - Production data protection

10. Data Leakage Prevention (A.8.12)
    - Protecting against data leaks
    - DLP tools and procedures
    - Monitoring and alerts

AUDIT CHECKLIST:
□ Is there a comprehensive asset inventory?
□ Does the inventory include all asset types (data, software, hardware, services)?
□ Is the inventory regularly reviewed and updated?
□ Are all assets assigned to an owner?
□ Is there an acceptable use policy?
□ Is there a process for return of assets on termination?
□ Is there an information classification scheme?
□ Are classification levels clearly defined (e.g., public, internal, confidential, restricted)?
□ Are assets labeled according to classification?
□ Are handling procedures defined for each classification level?
□ Is there a media disposal policy?
□ Is secure destruction verified and documented?
□ Is configuration management implemented?
□ Is there an information deletion/retention policy?
□ Is data masking used for sensitive data in non-production environments?
□ Are data leakage prevention controls in place?
□ Is there monitoring for unauthorized data transfers?""",
    },
    5: {
        "id": 5,
        "title": "A.9 Access Control",
        "controls": [
            "A.9.1 Business requirements of access control",
            "A.9.1.1 Access control policy",
            "A.9.1.2 Access to networks and network services",
            "A.9.2 User access management",
            "A.9.2.1 User registration and de-registration",
            "A.9.2.2 User access provisioning",
            "A.9.2.3 Management of privileged access rights",
            "A.9.2.4 Management of secret authentication information",
            "A.9.2.5 Review of user access rights",
            "A.9.2.6 Removal or adjustment of access rights",
            "A.9.3 User responsibilities",
            "A.9.3.1 Use of secret authentication information",
            "A.9.4 System and application access control",
            "A.9.4.1 Information access restriction",
            "A.9.4.2 Secure log-on procedures",
            "A.9.4.3 Password management system",
            "A.9.4.4 Use of privileged utility programs",
            "A.9.4.5 Access control to program source code",
        ],
        "keywords": [
            "access control",
            "authentication",
            "authorization",
            "password",
            "user management",
            "privileged access",
            "access rights",
            "login",
            "user registration",
            "MFA",
            "multi-factor",
            "network segmentation",
            "role-based access",
            "RBAC",
            "least privilege",
        ],
        "requirements": """ISO 27001:2022 A.9 Access Control Requirements:

KEY ASPECTS OF ACCESS CONTROL:

1. Business Requirements (A.9.1)
   - Development of an access control policy
   - Network segmentation implementation
   - Role-based access control (RBAC)
   - Principle of least privilege
   - Need-to-know basis for information access

2. User Access Management (A.9.2)
   - Formal user registration and de-registration process
   - User access provisioning procedures
   - Management of privileged access rights (admin accounts, root access)
   - Regular reviews of access permissions
   - Timely removal/adjustment of access rights when roles change

3. User Responsibilities (A.9.3)
   - Users must follow access control policies
   - Safeguarding authentication information (passwords, tokens, etc.)
   - Reporting security incidents

4. System & Application Access Control (A.9.4)
   - Secure log-on procedures
   - Password management systems
   - Multi-Factor Authentication (MFA) to protect against unauthorized access
   - Session management
   - Access control to program source code

Under ISO 27001:2022, controls are aligned with more granular requirements:
- Effective implementation reduces risk of data breaches
- Mitigates insider threats
- Ensures users have ONLY the minimum access needed for their roles

AUDIT CHECKLIST:
□ Is there a documented access control policy?
□ Does the policy align with business requirements?
□ Is network segmentation implemented?
□ Is role-based access control (RBAC) used?
□ Is there a formal user registration process?
□ Is there a formal user de-registration/offboarding process?
□ Are access provisioning requests documented and approved?
□ Is privileged access separately managed and controlled?
□ Are privileged accounts inventoried and monitored?
□ Are user access rights reviewed regularly (at least annually)?
□ Are access rights adjusted promptly when roles change?
□ Are users trained on their access control responsibilities?
□ Is authentication information (passwords) properly protected?
□ Are secure log-on procedures implemented?
□ Is there a password management policy (complexity, expiration, history)?
□ Is Multi-Factor Authentication (MFA) implemented for sensitive access?
□ Are sessions properly managed (timeout, re-authentication)?
□ Is access to source code restricted?
□ Are privileged utility programs controlled?
□ Is there logging and monitoring of access attempts?
□ Are failed login attempts monitored and acted upon?""",
    },
    6: {
        "id": 6,
        "title": "Annex A 5.7 - Threat Intelligence",
        "controls": [
            "A.5.7 Threat intelligence collection",
            "A.5.7.1 Strategic threat intelligence",
            "A.5.7.2 Operational threat intelligence",
            "A.5.7.3 Tactical threat intelligence",
            "A.5.7.4 Threat intelligence integration",
        ],
        "keywords": [
            "threat intelligence",
            "threat feeds",
            "indicators of compromise",
            "IoC",
            "TTPs",
            "tactics techniques procedures",
            "SIEM",
            "SOAR",
            "threat modeling",
            "threat landscape",
            "threat actors",
            "cyber threat",
            "actionable intelligence",
        ],
        "requirements": """ISO 27001:2022 Annex A 5.7 - Threat Intelligence Requirements:

KEY REQUIREMENTS:
1. Documented Process: Organizations must implement a documented, consistent process to gather, analyze, and disseminate threat intelligence.

2. Three Levels of Intelligence:
   - Strategic: High-level trends and threat actor tactics
   - Operational: Specific tactics, techniques, and procedures (TTPs)
   - Tactical: Technical Indicators of Compromise (IoCs) such as IPs and file hashes

3. Proactive Defense: Information must be used to improve security posture and inform risk assessments, not just for reactive incident response.

4. Actionable Insights: Information should be refined into actionable intelligence, ensuring it is relevant to the organization's specific threat landscape.

5. Integration: Threat intelligence should be integrated into existing workflows, such as SIEM, SOAR, or threat modeling, to enhance decision-making.

AUDIT CHECKLIST:
□ Is there a documented threat intelligence policy/procedure?
□ Are threat intelligence sources identified and documented?
□ Is strategic-level threat intelligence gathered (trends, threat actors)?
□ Is operational-level threat intelligence gathered (TTPs)?
□ Is tactical-level threat intelligence gathered (IoCs, IPs, hashes)?
□ Is threat intelligence used proactively to improve security posture?
□ Are risk assessments updated based on threat intelligence?
□ Is threat intelligence refined into actionable insights?
□ Is threat intelligence integrated with SIEM/SOAR systems?
□ Is there a process for disseminating threat intelligence to relevant teams?
□ Are threat intelligence sources reviewed for reliability?
□ Is there evidence of threat intelligence influencing security decisions?""",
    },
    7: {
        "id": 7,
        "title": "Annex A 6.1 - Screening",
        "controls": [
            "A.6.1 Background verification checks",
            "A.6.1.1 Identity verification",
            "A.6.1.2 Qualification verification",
            "A.6.1.3 Employment history verification",
            "A.6.1.4 Criminal record checks",
            "A.6.1.5 Credit checks",
            "A.6.1.6 Ongoing screening",
        ],
        "keywords": [
            "screening",
            "background check",
            "verification",
            "employment history",
            "criminal record",
            "credit check",
            "identity verification",
            "qualification",
            "references",
            "pre-employment",
            "personnel security",
            "vetting",
        ],
        "requirements": """ISO 27001:2022 Annex A 6.1 - Screening Requirements:

KEY SCREENING REQUIREMENTS:
1. Proportionate Approach: Screening must be based on risk, relevant legislation, regulations, and ethics.

2. Prior to Engagement: Checks must be completed before granting access to information systems.

3. Scope: Covers full-time, part-time, temporary staff, and third-party suppliers.

4. Key Verification Areas:
   - Identity verification (e.g., passport, driving license)
   - Academic and professional qualifications
   - Employment history (references)
   - Criminal record checks (if permitted by law and relevant to the role)
   - Credit checks (for high-risk, finance-related roles)

5. Ongoing Screening: Background checks should be repeated periodically or when there are significant changes to the risk profile of a role.

NECESSARY DOCUMENTATION:
- Formal Personnel Screening Policy defining procedures, criteria, and responsible roles
- Evidence of Compliance: Records showing screening was completed (audit logs, HR signed statements)
- Supplier Contracts: Evidence that screening requirements are included in third-party contracts

AUDIT FAILURE POINTS:
- No documented screening procedures for all staff
- Screening was done but no evidence was retained
- Background checks not tailored to the risk level of the role

AUDIT CHECKLIST:
□ Is there a formal personnel screening policy?
□ Is screening proportionate to the risk level of the role?
□ Is screening completed before access is granted to information systems?
□ Does screening cover all staff types (full-time, part-time, temporary)?
□ Are third-party suppliers subject to screening requirements?
□ Is identity verification performed (passport, ID)?
□ Are qualifications verified?
□ Are employment references checked?
□ Are criminal record checks performed where appropriate?
□ Are credit checks performed for high-risk financial roles?
□ Is there evidence of screening completion retained?
□ Is ongoing/periodic screening performed?
□ Are screening requirements included in supplier contracts?""",
    },
    8: {
        "id": 8,
        "title": "Annex A 7.4 - Physical Security Monitoring",
        "controls": [
            "A.7.4 Physical security monitoring",
            "A.7.4.1 Video surveillance systems",
            "A.7.4.2 Intrusion detection systems",
            "A.7.4.3 Alarm systems configuration",
            "A.7.4.4 Surveillance system protection",
        ],
        "keywords": [
            "physical security",
            "CCTV",
            "surveillance",
            "monitoring",
            "intrusion detection",
            "alarm",
            "motion detector",
            "access control",
            "security camera",
            "physical access",
            "premises",
            "restricted area",
        ],
        "requirements": """ISO 27001:2022 Annex A 7.4 - Physical Security Monitoring Requirements:

PURPOSE:
Implement appropriate surveillance tools to detect and prevent external and internal intruders from entering restricted physical areas.

SURVEILLANCE TOOLS MUST PROTECT AGAINST:
- Data theft
- Loss of information assets
- Financial damage
- Removal of removable media
- Malware infection of IT assets
- Ransomware attacks by intruders

THREE IMPLEMENTATION STEPS:

1. Video Monitoring System:
   - CCTV cameras for continuous monitoring of restricted areas
   - Records of all entries and exits on premises

2. Intrusion Detection - Install detectors to trigger alarms:
   - Contact detectors: Trigger alarm when unknown object contacts doors/windows
   - Motion detectors: Alert when movement detected in range
   - Sound detectors: Break glass detectors for intrusion attempts

3. Alarm Configuration:
   - Ensure all sensitive areas are within alarm range
   - Cover external doors, windows, unoccupied areas, computer rooms
   - Don't forget smoking areas, gym entrances, etc.

SURVEILLANCE SYSTEM TYPES:
- CCTV cameras
- Security guards
- Intruder alarm systems
- Physical security management software

SUPPLEMENTARY GUIDANCE:
- Keep monitoring system design confidential
- Implement measures to prevent remote disabling of systems
- Alarm control panel in alarm-equipped area with safe exit access
- Use tamper-proof detectors
- Comply with data protection laws (GDPR) for surveillance recordings

AUDIT CHECKLIST:
□ Are all restricted areas identified?
□ Is there a video surveillance system (CCTV) in place?
□ Are entries and exits to premises recorded?
□ Are intrusion detection systems installed (motion, contact, sound)?
□ Are alarm systems properly configured for all sensitive areas?
□ Is the alarm control panel in a secure, accessible location?
□ Are detectors tamper-proof?
□ Is surveillance system design kept confidential?
□ Are measures in place to prevent remote disabling?
□ Does surveillance comply with data protection laws (GDPR)?
□ Are surveillance recordings retained per legal requirements?
□ Is there regular testing of monitoring systems?""",
    },
    9: {
        "id": 9,
        "title": "Annex A 8.18 - Use of Privileged Utility Programs",
        "controls": [
            "A.8.18 Privileged utility program control",
            "A.8.18.1 Identification of privileged utilities",
            "A.8.18.2 Authorization controls",
            "A.8.18.3 Usage logging and monitoring",
            "A.8.18.4 Just-in-time access",
        ],
        "keywords": [
            "privileged utility",
            "admin tools",
            "debugger",
            "disk editor",
            "network analyzer",
            "packet sniffer",
            "privileged access",
            "PAM",
            "just-in-time",
            "separation of duties",
            "system tools",
            "administrative tools",
        ],
        "requirements": """ISO 27001:2022 Annex A 8.18 - Use of Privileged Utility Programs Requirements:

PURPOSE:
Strict control over utility programs that can override system security (debuggers, admin tools) to prevent unauthorized changes, data breaches, and system instability.

KEY REQUIREMENTS & IMPLEMENTATION:

1. Identify & Restrict:
   - Identify all tools capable of bypassing controls (disk editors, network analyzers)
   - Limit access to these tools

2. Authorization:
   - Ensure privileged utilities are only used by authorized personnel
   - Not accessible from standard user accounts

3. Logging:
   - Implement comprehensive, granular logging of all actions
   - Log who used tools and when

4. Just-in-Time Access:
   - Use Privileged Access Management (PAM) tools
   - Temporary elevation of privileges, reducing long-term exposure

5. Separation of Duties:
   - Users authorized to use utilities must be different from those who authorize their use

EXAMPLES OF COVERED PROGRAMS:
- Backup and restore software
- Disk defragmenters and editor tools
- Network management and diagnostic tools (packet sniffers, SIEM)
- Debuggers and system modification tools
- Antivirus/anti-malware software

AUDIT EVIDENCE REQUIRED:
- Policy/procedure defining authorized privileged utility programs
- Access request logs and authorization records
- Audit logs showing who used tools and when
- Documentation of periodic reviews of user access rights

AUDIT CHECKLIST:
□ Are all privileged utility programs identified and inventoried?
□ Is there a policy defining authorized privileged utility programs?
□ Is access to privileged utilities restricted to authorized personnel only?
□ Are privileged utilities not accessible from standard user accounts?
□ Is comprehensive logging implemented for utility usage?
□ Are all actions performed by privileged utilities logged?
□ Is Just-in-Time (JIT) access implemented via PAM tools?
□ Is there separation of duties (users vs. authorizers)?
□ Are access request logs and authorization records maintained?
□ Are periodic reviews of access rights conducted?
□ Are privileged utilities protected from unauthorized modification?""",
    },
    10: {
        "id": 10,
        "title": "Annex A 8.2 - Access Rights",
        "controls": [
            "A.8.2 Access rights management",
            "A.8.2.1 User access provisioning",
            "A.8.2.2 Access rights authorization",
            "A.8.2.3 Access rights revocation",
            "A.8.2.4 Periodic access reviews",
        ],
        "keywords": [
            "access rights",
            "provisioning",
            "authorization",
            "revocation",
            "access review",
            "privilege creep",
            "least privilege",
            "user access",
            "access control",
            "system access",
            "offboarding",
            "role change",
        ],
        "requirements": """ISO 27001 Annex A 8.2 (2022) / A.9.2 (2013) - Access Rights Management Requirements:

PURPOSE:
Formal, documented process to manage user access rights including provisioning, reviewing, and revoking access.

KEY ASPECTS:

1. Provisioning Process:
   - Formal process for granting and removing access
   - Applies to all users (employees and third parties)

2. Authorization:
   - Access must be authorized by system owners
   - Checks to ensure access is appropriate for the role

3. Prompt Revocation:
   - Access rights must be revoked immediately when users change roles or leave
   - Timely response to role changes

4. Privileged Access:
   - Specific, strict controls needed for privileged access (system administrators)
   - Higher risk requires stronger controls

5. Periodic Review:
   - Access rights reviewed periodically
   - Prevent "privilege creep"
   - Ensure continued appropriateness

DOCUMENTATION REQUIRED:
- Central record or database of access privileges
- Documented procedures for user access provisioning
- Logs of changes to access rights
- Evidence of periodic access reviews
- Authorization records from system owners

NOTE: In ISO 27001:2022, this control is covered under Annex A 5.18 (Access Rights) and A 5.15 (Access Control).

AUDIT CHECKLIST:
□ Is there a formal user access provisioning process?
□ Are access rights authorized by system owners?
□ Is there documentation of access authorization requests?
□ Are access rights revoked promptly upon role change or termination?
□ Is there a central record/database of access privileges?
□ Are privileged access rights subject to stricter controls?
□ Are periodic access reviews conducted?
□ Is there evidence of access review completion?
□ Are changes to access rights logged?
□ Is there a process to prevent privilege creep?
□ Are third-party access rights managed and reviewed?
□ Is there a documented offboarding process for access revocation?""",
    },
}


class DocumentAnalyzer:
    """
    Analyzes documents against ISO 27001 checklists using Azure OpenAI.
    """
    
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        
        self.azure_api_key = os.getenv("AZURE_OPENAI_KEY")
        self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.azure_deployment = os.getenv("AZURE_DEPLOYMENT")
        self.use_azure = bool(self.azure_api_key and self.azure_endpoint and self.azure_deployment)
        
        if self.use_azure:
            try:
                from openai import AzureOpenAI
                self.client = AzureOpenAI(
                    api_key=self.azure_api_key,
                    azure_endpoint=self.azure_endpoint,
                    api_version="2024-12-01-preview"
                )
                logger.info("Azure OpenAI client initialized successfully")
            except ImportError:
                logger.warning("OpenAI package not installed. Using mock analysis.")
                self.use_azure = False
            except Exception as e:
                logger.warning(f"Failed to initialize Azure OpenAI: {e}. Using mock analysis.")
                self.use_azure = False
        else:
            logger.info("Azure OpenAI credentials not found. Using mock analysis.")
    
    def _sanitize_text(self, text: str) -> str:
        """
        Remove invalid Unicode characters (surrogates) from text.
        This prevents encoding errors when processing PDF text.
        """
        if not text:
            return ""
        
        # Remove surrogate characters (U+D800 to U+DFFF)
        sanitized = text.encode('utf-8', errors='surrogatepass').decode('utf-8', errors='replace')
        
        # Remove any remaining surrogate characters
        sanitized = re.sub(r'[\ud800-\udfff]', '', sanitized)
        
        # Remove control characters except newlines and tabs
        sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', sanitized)
        
        return sanitized
    
    def analyze(
        self,
        analysis_result,
        document_chunks: List[Dict[str, Any]],
    ) -> bool:
        """
        Analyze document chunks against an ISO 27001 checklist.
        
        Args:
            analysis_result: The AnalysisResult model instance to update
            document_chunks: List of document chunks with their content
            
        Returns:
            True if analysis succeeded, False otherwise
        """
        from ..models import AnalysisResult
        
        try:
            # Update status to processing
            analysis_result.status = AnalysisResult.Status.PROCESSING
            analysis_result.save()
            
            checklist_id = analysis_result.checklist_id
            checklist_info = ISO27001_CHECKLISTS.get(checklist_id, {})
            
            print("\n" + "="*80)
            print("🔍 ISOGUARD ANALYSIS STARTED")
            print("="*80)
            print(f"📋 Checklist: {analysis_result.checklist_title}")
            print(f"📄 Documents: {len(document_chunks)} chunk(s) to analyze")
            print(f"🤖 Using: {'Azure OpenAI' if self.use_azure else 'Mock Analysis'}")
            
            # Combine all chunk content and sanitize
            combined_content = "\n\n".join([
                chunk.get("content", "") for chunk in document_chunks
            ])
            
            # Sanitize content to remove invalid Unicode characters
            combined_content = self._sanitize_text(combined_content)
            
            print(f"📝 Total content length: {len(combined_content)} characters")
            
            if not combined_content.strip():
                print("❌ ERROR: No document content to analyze")
                analysis_result.status = AnalysisResult.Status.FAILED
                analysis_result.error_message = "No document content to analyze"
                analysis_result.save()
                return False
            
            # Perform analysis
            print("\n⏳ Sending to AI for analysis...")
            if self.use_azure:
                result = self._analyze_with_azure(
                    combined_content,
                    checklist_info,
                    analysis_result.checklist_title
                )
            else:
                result = self._analyze_mock(
                    combined_content,
                    checklist_info,
                    analysis_result.checklist_title
                )
            
            # Log the results
            print("\n" + "-"*80)
            print("📊 ANALYSIS RESULTS")
            print("-"*80)
            print(f"✅ Compliance Status: {result.get('compliance_status', 'N/A').upper()}")
            print(f"📈 Compliance Score: {result.get('compliance_score', 0) * 100:.1f}%")
            print(f"\n📝 Summary:\n   {result.get('summary', 'No summary available')}")
            
            if result.get('findings'):
                print(f"\n🔎 Findings ({len(result.get('findings', []))})")
                for i, finding in enumerate(result.get('findings', [])[:5], 1):
                    print(f"   {i}. {finding}")
            
            if result.get('recommendations'):
                print(f"\n💡 Recommendations ({len(result.get('recommendations', []))})")
                for i, rec in enumerate(result.get('recommendations', [])[:5], 1):
                    print(f"   {i}. {rec}")
            
            if result.get('gaps'):
                print(f"\n⚠️  Gaps ({len(result.get('gaps', []))})")
                for i, gap in enumerate(result.get('gaps', [])[:5], 1):
                    print(f"   {i}. {gap}")
            
            if result.get('comments'):
                print(f"\n💬 Comments ({len(result.get('comments', []))})")
                for i, comment in enumerate(result.get('comments', [])[:5], 1):
                    print(f"   {i}. {comment}")
            
            if result.get('control_scores'):
                print(f"\n📋 Control Scores:")
                for control, score in result.get('control_scores', {}).items():
                    bar = '█' * int(score * 10) + '░' * (10 - int(score * 10))
                    print(f"   {control}: [{bar}] {score * 100:.0f}%")
            
            print("\n" + "="*80)
            print("✅ ANALYSIS COMPLETE")
            print("="*80 + "\n")
            
            # Update the analysis result
            analysis_result.compliance_status = result.get("compliance_status")
            analysis_result.compliance_score = result.get("compliance_score", 0.0)
            analysis_result.summary = result.get("summary", "")
            analysis_result.findings = result.get("findings", [])
            analysis_result.recommendations = result.get("recommendations", [])
            analysis_result.gaps = result.get("gaps", [])
            analysis_result.comments = result.get("comments", [])
            analysis_result.control_scores = result.get("control_scores", {})
            analysis_result.status = AnalysisResult.Status.COMPLETED
            analysis_result.completed_at = timezone.now()
            analysis_result.save()
            
            return True
            
        except Exception as e:
            print(f"\n❌ ANALYSIS FAILED: {e}")
            logger.error(f"Analysis failed: {e}")
            analysis_result.status = AnalysisResult.Status.FAILED
            analysis_result.error_message = str(e)
            analysis_result.save()
            return False
    
    def _analyze_with_azure(
        self,
        content: str,
        checklist_info: Dict,
        checklist_title: str
    ) -> Dict[str, Any]:
        """Use Azure OpenAI to analyze the document content."""
        
        controls = checklist_info.get("controls", [])
        controls_text = "\n".join([f"- {c}" for c in controls])
        
        # Get the comprehensive requirements for this checklist
        requirements = checklist_info.get("requirements", "")
        
        # Truncate content to fit within token limits
        max_content_chars = 18000  # Reduced to accommodate requirements
        truncated_content = content[:max_content_chars]
        
        prompt = f"""You are an expert ISO 27001:2022 compliance auditor. Analyze the following audit report/document content against the ISO 27001 checklist item: "{checklist_title}".

=== SPECIFIC CONTROLS TO EVALUATE ===
{controls_text}

=== ISO 27001:2022 REQUIREMENTS AND AUDIT CHECKLIST ===
{requirements}

=== DOCUMENT CONTENT TO ANALYZE ===
{truncated_content}

=== ANALYSIS INSTRUCTIONS ===
Perform a thorough compliance analysis against ALL requirements listed above. For each audit checklist item, determine if the document provides evidence of compliance.

Return ONLY valid JSON with exactly this shape:
{{
    "compliance_status": "compliant" | "partial" | "non_compliant" | "not_applicable",
    "compliance_score": 0.0 to 1.0 (where 1.0 is fully compliant, based on percentage of checklist items satisfied),
    "summary": "Executive summary of the compliance assessment (2-3 sentences summarizing overall compliance posture)",
    "findings": [
        "Specific finding 1 with direct reference to document content that addresses a requirement",
        "Specific finding 2 indicating what requirement is met and how"
    ],
    "recommendations": [
        "Actionable recommendation 1 to improve compliance",
        "Actionable recommendation 2 to address specific gaps"
    ],
    "gaps": [
        "Specific requirement from the audit checklist that is NOT addressed in the document",
        "Another missing requirement with explanation of what should be documented"
    ],
    "comments": [
        "General observation about the audit report quality and completeness",
        "Comment on documentation thoroughness for this control area",
        "Suggestions for improving the audit evidence"
    ],
    "control_scores": {{
        "control_name": 0.0 to 1.0,
        "another_control": 0.0 to 1.0
    }}
}}

IMPORTANT GUIDELINES:
1. Reference the actual document content in your findings
2. Map gaps directly to the audit checklist items that are not satisfied
3. Provide practical, actionable recommendations
4. Score each control individually based on evidence in the document
5. Be strict in your assessment - only mark items as compliant if there is clear evidence
6. Consider ISO 27001:2022 specific requirements including new controls"""

        try:
            print(f"   🌐 Calling Azure OpenAI (deployment: {self.azure_deployment})...")
            
            response = self.client.chat.completions.create(
                model=self.azure_deployment,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert ISO 27001 compliance auditor with deep knowledge of information security management systems. Always respond with valid JSON only. Provide detailed, specific, and actionable analysis."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_completion_tokens=4096,
            )
            
            print(f"   ✅ Azure OpenAI response received")
            
            raw_output = response.choices[0].message.content
            print(f"   📝 Response length: {len(raw_output)} characters")
            
            # Parse JSON response
            try:
                result = json.loads(raw_output)
            except json.JSONDecodeError:
                # Try to extract JSON from the response if it contains extra text
                json_match = re.search(r'\{[\s\S]*\}', raw_output)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError(f"LLM returned invalid JSON:\n{raw_output[:500]}")
            
            # Validate and normalize the result
            return self._normalize_result(result)
            
        except Exception as e:
            print(f"   ❌ Azure OpenAI error: {e}")
            logger.error(f"Azure OpenAI analysis failed: {e}")
            # Fall back to mock analysis
            print(f"   ↩️  Falling back to mock analysis...")
            return self._analyze_mock(content, checklist_info, checklist_title)
    
    def _analyze_mock(
        self,
        content: str,
        checklist_info: Dict,
        checklist_title: str
    ) -> Dict[str, Any]:
        """
        Perform mock analysis when Azure OpenAI is not available.
        Uses keyword matching and basic heuristics.
        """
        
        content_lower = content.lower()
        keywords = checklist_info.get("keywords", [])
        controls = checklist_info.get("controls", [])
        requirements = checklist_info.get("requirements", "")
        
        # Extract audit checklist items from requirements
        audit_items = []
        if requirements:
            for line in requirements.split('\n'):
                if line.strip().startswith('□'):
                    audit_items.append(line.strip()[1:].strip())
        
        # Count keyword matches
        keyword_matches = sum(1 for kw in keywords if kw.lower() in content_lower)
        keyword_ratio = keyword_matches / len(keywords) if keywords else 0
        
        # Check audit items coverage
        audit_matches = 0
        audit_gaps = []
        for item in audit_items:
            # Extract key terms from audit item
            key_terms = [word.lower() for word in item.split() if len(word) > 4][:3]
            if any(term in content_lower for term in key_terms):
                audit_matches += 1
            else:
                audit_gaps.append(item)
        
        audit_ratio = audit_matches / len(audit_items) if audit_items else keyword_ratio
        
        # Combined score based on keywords and audit items
        combined_ratio = (keyword_ratio + audit_ratio) / 2 if audit_items else keyword_ratio
        
        # Determine compliance status based on combined coverage
        if combined_ratio >= 0.7:
            compliance_status = "compliant"
            compliance_score = 0.7 + (combined_ratio * 0.3)
        elif combined_ratio >= 0.4:
            compliance_status = "partial"
            compliance_score = 0.4 + (combined_ratio * 0.3)
        elif combined_ratio > 0:
            compliance_status = "non_compliant"
            compliance_score = combined_ratio * 0.4
        else:
            compliance_status = "not_applicable"
            compliance_score = 0.0
        
        # Generate findings based on matched keywords
        matched_keywords = [kw for kw in keywords if kw.lower() in content_lower]
        missing_keywords = [kw for kw in keywords if kw.lower() not in content_lower]
        
        findings = []
        if matched_keywords:
            findings.append(f"Document addresses the following topics: {', '.join(matched_keywords[:5])}")
        if audit_matches > 0:
            findings.append(f"Document satisfies {audit_matches} of {len(audit_items)} audit checklist items")
        
        recommendations = []
        gaps = []
        
        # Add audit gaps
        for gap in audit_gaps[:5]:
            gaps.append(f"Audit requirement not satisfied: {gap}")
        
        if missing_keywords:
            recommendations.append(f"Consider adding documentation for: {', '.join(missing_keywords[:3])}")
        
        for control in controls[:3]:
            if not any(word in content_lower for word in control.lower().split()[:3]):
                gaps.append(f"Control '{control}' may not be adequately addressed")
                recommendations.append(f"Review and document compliance with '{control}'")
        
        summary = f"Analysis of '{checklist_title}' based on document review. "
        summary += f"Found {keyword_matches} of {len(keywords)} expected topics covered. "
        if audit_items:
            summary += f"Satisfied {audit_matches} of {len(audit_items)} audit requirements. "
        summary += f"Overall compliance score: {compliance_score:.1%}."
        
        # Generate comments for the audit report
        comments = [
            f"Document analyzed contains {len(content)} characters of content.",
            f"Keyword coverage: {keyword_ratio:.1%} of expected terms found.",
        ]
        if audit_items:
            comments.append(f"Audit checklist coverage: {audit_ratio:.1%} ({audit_matches}/{len(audit_items)} items).")
        if compliance_status == "compliant":
            comments.append("The audit report demonstrates strong compliance documentation.")
        elif compliance_status == "partial":
            comments.append("The audit report shows partial coverage; additional documentation recommended.")
        else:
            comments.append("The audit report requires significant enhancement to demonstrate compliance.")
        
        # Generate control scores
        control_scores = {}
        for control in controls:
            control_name = control.split()[0] if control else "Unknown"
            # Simple heuristic: check if control keywords appear in content
            control_words = control.lower().split()[:4]
            matches = sum(1 for word in control_words if word in content_lower)
            control_scores[control_name] = round(matches / max(len(control_words), 1), 2)
        
        return {
            "compliance_status": compliance_status,
            "compliance_score": round(compliance_score, 2),
            "summary": summary,
            "findings": findings[:5],
            "recommendations": recommendations[:5],
            "gaps": gaps[:8],
            "comments": comments[:5],
            "control_scores": control_scores,
        }
    
    def _normalize_result(self, result: Dict) -> Dict[str, Any]:
        """Normalize and validate the analysis result."""
        
        valid_statuses = ["compliant", "partial", "non_compliant", "not_applicable"]
        status = result.get("compliance_status", "non_compliant")
        if status not in valid_statuses:
            status = "non_compliant"
        
        score = result.get("compliance_score", 0.5)
        try:
            score = float(score)
            score = max(0.0, min(1.0, score))
        except (ValueError, TypeError):
            score = 0.5
        
        # Normalize control_scores
        control_scores = result.get("control_scores", {})
        if isinstance(control_scores, dict):
            normalized_scores = {}
            for ctrl, ctrl_score in control_scores.items():
                try:
                    normalized_scores[str(ctrl)] = round(max(0.0, min(1.0, float(ctrl_score))), 2)
                except (ValueError, TypeError):
                    normalized_scores[str(ctrl)] = 0.5
            control_scores = normalized_scores
        else:
            control_scores = {}
        
        return {
            "compliance_status": status,
            "compliance_score": round(score, 2),
            "summary": str(result.get("summary", ""))[:2000],
            "findings": list(result.get("findings", []))[:10],
            "recommendations": list(result.get("recommendations", []))[:10],
            "gaps": list(result.get("gaps", []))[:10],
            "comments": list(result.get("comments", []))[:10],
            "control_scores": control_scores,
        }
