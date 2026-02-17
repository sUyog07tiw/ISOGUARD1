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
