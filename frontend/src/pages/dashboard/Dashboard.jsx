import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";

const checklists = [
  { 
    id: 1, 
    title: "Annex A 5.1 - Policies for Information Security", 
    description: "Management direction and support for information security in accordance with business requirements and relevant laws and regulations.",
    keyControls: ["Policy Definition", "Management Approval", "Policy Communication", "Scheduled Reviews", "Topic-Specific Policies", "Compliance Commitments"],
    domain: "Organisational Controls",
    aiPrompt: `ISO 27001:2022 Annex A 5.1 - Policies for Information Security:

OVERVIEW:
ISO 27001:2022 Annex A 5.1 requires organizations to define, approve, publish, and communicate a top-level information security policy along with topic-specific policies (e.g., access control, remote working). These policies must be authorized by management, reviewed regularly, and communicated to relevant personnel, providing a foundation for security governance, risk management, and regulatory compliance.

KEY REQUIREMENTS:
1. Policy Content & Structure:
   - An overarching Information Security Policy should be complemented by specific policies
   - Target identified risks and compliance requirements (e.g., password policies, data classification)
   - Clear definition of information security scope and objectives

2. Management Approval:
   - Policies must be approved by senior management
   - Ensures organizational backing and commitment
   - Formal authorization and sign-off required

3. Communication & Awareness:
   - Policies must be disseminated to employees and relevant stakeholders
   - Evidence of acknowledgement required (e.g., sign-off, training records)
   - Regular awareness training on policy content

4. Regular Review:
   - Policies should be reviewed at planned intervals
   - Review when significant changes occur
   - Ensure policies remain relevant and accurate

5. Alignment:
   - Policies must align with business needs
   - Conform to contractual obligations
   - Meet legal/regulatory requirements

COMMON PITFALLS TO AVOID:
- Using generic templates without customization
- Failing to review policies annually
- Not communicating updates to staff
- Lack of version control
- No evidence of acknowledgement

AUDIT CHECKLIST:
□ Is there a documented top-level information security policy?
□ Are topic-specific policies defined (access control, remote working, etc.)?
□ Is the policy approved by senior management?
□ Is there evidence of management authorization?
□ Has the policy been communicated to all relevant personnel?
□ Is there evidence of acknowledgement (sign-off, training records)?
□ Is there a scheduled review process?
□ When was the last policy review conducted?
□ Does the policy align with business requirements?
□ Does it address contractual obligations?
□ Does it meet legal/regulatory requirements?
□ Are policy changes communicated to staff?
□ Is version control maintained?`
  },
  { 
    id: 2, 
    title: "Annex A 5.2 - Information Security Roles and Responsibilities", 
    description: "Define and allocate information security roles and responsibilities according to organization needs.",
    keyControls: ["Role Definition", "Responsibility Allocation", "Authority Assignment", "Competence Requirements", "Documentation", "Accountability"],
    domain: "Organisational Controls",
    aiPrompt: `ISO 27001:2022 Annex A 5.2 - Information Security Roles and Responsibilities:

OVERVIEW:
ISO 27001:2022 Annex A 5.2 requires organizations to define, document, and allocate information security roles and responsibilities to ensure that data protection duties are clearly understood and enforced. Key requirements include assigning ownership for assets, implementing a RACI matrix, ensuring segregation of duties, and maintaining documented evidence for audits.

KEY REQUIREMENTS FOR COMPLIANCE:
1. Define and Document Roles:
   - Clearly outline information security tasks
   - Assign them to specific roles
   - Include Top Management, security personnel, and general employees

2. Asset Ownership:
   - Designate owners for all information assets
   - Ensure day-to-day security responsibility is assigned
   - Document ownership in asset register

3. Assign Responsibilities:
   - Create a responsibility matrix (e.g., RACI)
   - Define who is Responsible, Accountable, Consulted, and Informed
   - Cover all specific security tasks

4. Communication:
   - Ensure roles and responsibilities are communicated to all employees
   - Include relevant stakeholders
   - Provide regular updates on changes

5. Documentation and Review:
   - Maintain documented information (job descriptions, security procedures)
   - Review them regularly
   - Keep evidence for audits

6. Segregation of Duties:
   - Ensure conflicting duties are separated
   - Prevent unauthorized actions
   - Document segregation requirements

COMMON ROLES TO DEFINE:
- Top Management: Setting strategy, allocating resources, approving policies
- Information Security Manager/Officer: Overseeing the ISMS
- Asset Owners: Responsible for classification and protection of specific data
- All Employees: Adhering to security policies

BENEFITS:
- Ensures accountability
- Reduces risk of security incidents due to neglected tasks
- Ensures organization has necessary resources to manage security risks

AUDIT CHECKLIST:
□ Are all information security roles defined and documented?
□ Is there a responsibility matrix (RACI) in place?
□ Are asset owners designated for all information assets?
□ Is there evidence of role communication to employees?
□ Are job descriptions updated with security responsibilities?
□ Is there segregation of conflicting duties?
□ Is Top Management's security role documented?
□ Is there an Information Security Manager/Officer appointed?
□ Are roles reviewed regularly?
□ Is there documented evidence for audit purposes?
□ Are accountability areas clearly defined?`
  },
  { 
    id: 3, 
    title: "Annex A 5.9 - Inventory of Information and Other Associated Assets", 
    description: "Identify, document, and maintain an inventory of information and other associated assets including their owners.",
    keyControls: ["Asset Identification", "Asset Register", "Owner Assignment", "Classification Labeling", "Regular Updates", "Lifecycle Management"],
    isNew: true,
    domain: "Organisational Controls",
    aiPrompt: `ISO 27001:2022 Annex A 5.9 - Inventory of Information and Other Associated Assets (NEW in 2022):

OVERVIEW:
ISO 27001:2022 Annex A 5.9 requires organizations to create, maintain, and regularly update a comprehensive inventory of all information, software, physical, and services-based assets. Key requirements include assigning ownership, documenting asset locations, and ensuring security controls are applied to protect these assets.

KEY REQUIREMENTS:
1. Comprehensive Identification:
   - Identify all information assets
   - Identify all software assets
   - Identify all hardware and physical assets
   - Include assets that store, process, or transmit data

2. Asset Register Maintenance:
   - Maintain an accurate, up-to-date inventory
   - Often called an Asset Register or Asset Inventory
   - Include cloud and remote environment assets

3. Ownership Assignment:
   - Assign a designated owner for each asset in the inventory
   - Document ownership accountability
   - Clear responsibility for asset security

4. Classification:
   - Classify assets based on importance to the organization
   - Align with information security policies
   - Document classification levels

5. Scope:
   - Physical items: servers, laptops, network equipment
   - Intangible assets: data sets, software, cloud services
   - Services: SaaS, IaaS, PaaS

6. Integration:
   - Inventory should be consistent with other records
   - Subject to regular reviews
   - Linked to risk assessments

DIFFERENCES FROM ISO 27001:2013:
The 2022 update expands the 2013 version (A.8.1.1) to be more explicit about covering a wide range of both information and associated assets (e.g., in cloud/remote environments) to ensure a holistic view of the attack surface.

IMPLEMENTATION TIPS:
- Use automated tools for tracking in dynamic or cloud environments
- Ensure inventory includes physical or logical location of assets
- For smaller companies, integrate asset inventory into risk register
- Include "Shadow IT" by auditing for assets not formally approved but used for business purposes

AUDIT CHECKLIST:
□ Is there a documented asset inventory/register?
□ Does it include all information assets?
□ Does it include software assets?
□ Does it include physical/hardware assets?
□ Does it include cloud services?
□ Is each asset uniquely identified?
□ Are asset owners assigned for each asset?
□ Are asset locations documented (physical or logical)?
□ Is asset classification documented?
□ Is the inventory regularly reviewed and updated?
□ Is there a process for adding new assets?
□ Is there a process for retiring assets?
□ Is Shadow IT addressed?
□ Are automated tracking tools used where applicable?
□ Is the inventory integrated with risk assessments?`
  },
  { 
    id: 4, 
    title: "Annex A 5.10 - Acceptable Use of Information and Other Associated Assets", 
    description: "Rules for acceptable use of information and other associated assets shall be identified, documented and implemented.",
    keyControls: ["Usage Rules", "User Agreements", "Return of Assets", "Personal Device Policy", "Monitoring Notice", "Violation Consequences"],
    domain: "Organisational Controls",
    aiPrompt: `ISO 27001:2022 Annex A 5.10 - Acceptable Use of Information and Other Associated Assets:

OVERVIEW:
ISO 27001:2022 Annex A 5.10 requires organizations to identify, document, and implement rules for the acceptable use of information and associated assets (e.g., hardware, software, cloud services) to prevent misuse and secure data. This control mandates a formal policy defining permissible and prohibited actions, including BYOD, for all employees and third parties, with mandatory acknowledgment.

KEY REQUIREMENTS FOR COMPLIANCE:
1. Documented Policy:
   - A formal Acceptable Use Policy (AUP) must be approved by management
   - Cover all information, systems, and devices
   - Include clear definitions and scope

2. Rules of Use:
   - Explicitly define rules for handling information
   - Include email, internet usage, and BYOD/cloud services
   - Address remote working scenarios

3. Prohibited Activities:
   - Clearly outline forbidden actions
   - Unauthorized software installation
   - Illegal content access
   - Misuse of company resources for personal, commercial, or unethical purposes

4. Asset Protection:
   - Define rules for the entire information life cycle
   - Include storage, handling, and secure disposal
   - Address data retention requirements

5. User Acknowledgement:
   - All users (employees, contractors, third parties) must sign or formally accept the policy
   - Ensure understanding of their responsibilities
   - Document acknowledgement for audit purposes

6. Monitoring & Enforcement:
   - Detail how usage is monitored (e.g., network logs, email monitoring)
   - Define consequences of policy violations
   - Ensure legal compliance with monitoring

SCOPE OF ASSETS COVERED:
- Hardware: Laptops, phones, tablets, removable media
- Software & Services: Applications, cloud services (SaaS), email
- Networks: Wired and wireless, VPNs
- Information/Data: Intellectual property, client data, records

AUDIT CHECKLIST:
□ Is there a documented Acceptable Use Policy (AUP)?
□ Is the policy approved by management?
□ Does it cover email and internet usage?
□ Does it address BYOD requirements?
□ Does it cover cloud services?
□ Are prohibited activities clearly defined?
□ Are rules for the information life cycle documented?
□ Is secure disposal addressed?
□ Have all users (employees, contractors) acknowledged the policy?
□ Is there documented evidence of acknowledgement?
□ Is monitoring disclosed and legally compliant?
□ Are consequences of violations clearly stated?
□ Are third parties included in the policy scope?
□ Is the policy reviewed and updated regularly?`
  },
  { 
    id: 5, 
    title: "Annex A 5.12 - Classification of Information", 
    description: "Information shall be classified according to the organization's information security needs based on confidentiality, integrity, and availability.",
    keyControls: ["Classification Scheme", "Labeling Procedures", "Handling Rules", "Declassification", "Information Lifecycle", "Third-Party Classification"],
    domain: "Organisational Controls",
    aiPrompt: `ISO 27001:2022 Annex A 5.12 - Classification of Information:

OVERVIEW:
ISO 27001:2022 Annex A 5.12 requires organizations to classify information based on its security needs, including confidentiality, integrity, availability, and stakeholder requirements, ensuring protection is proportional to sensitivity. This control mandates creating a consistent classification scheme, defining handling rules, and managing information throughout its lifecycle to prevent unauthorized disclosure.

KEY REQUIREMENTS AND IMPLEMENTATION:
1. Classification Criteria:
   - Information should be categorized based on legal requirements
   - Consider sensitivity and value to the organization
   - Assess impact of unauthorized disclosure or modification

2. Scheme Development:
   - Define a clear, consistent classification scheme
   - Typical levels: Public, Internal, Confidential, Restricted
   - Ensure organization-wide consistency

3. Handling Rules:
   - Establish specific handling procedures for each classification level
   - Define storage requirements
   - Define transmission procedures
   - Include secure disposal requirements

4. Consistency (2022 Update):
   - The 2022 update emphasizes ensuring consistency in classification
   - Critical when sharing information between organizations
   - Align with partner/supplier classification schemes

5. Scope:
   - Applies to all information assets
   - Including digital files, physical documents, and databases
   - Cover structured and unstructured data

BENEFITS OF A.5.12 IMPLEMENTATION:
- Proportional Security: Efficient allocation of resources by focusing tighter controls on highly sensitive data
- Improved Risk Management: Facilitates identifying the most critical assets requiring protection
- Clarity for Employees: Provides clear guidance on how to handle different types of information

RELATED CONTROLS:
- Annex A 5.13: Labelling of Information
- Annex A 8.3: Information Access Restriction

AUDIT CHECKLIST:
□ Is there a documented classification scheme?
□ Are classification levels clearly defined (e.g., Public, Internal, Confidential, Restricted)?
□ Is the scheme based on confidentiality, integrity, and availability requirements?
□ Does it consider legal and regulatory requirements?
□ Are classification criteria documented?
□ Are handling rules defined for each classification level?
□ Are storage requirements specified per level?
□ Are transmission requirements specified per level?
□ Are disposal requirements specified per level?
□ Is there consistency when sharing information with third parties?
□ Are information owners responsible for classifying their information?
□ Is there a labeling procedure (A.5.13)?
□ Are labels applied consistently?
□ Is there a periodic review and reclassification process?
□ Is there training on classification requirements?`
  },
  { 
    id: 6, 
    title: "Annex A 5.7 - Threat Intelligence", 
    description: "Collect and analyse information about threats to produce threat intelligence for informed security decisions.",
    keyControls: ["Documented Process", "Strategic Intelligence", "Operational Intelligence", "Tactical Intelligence", "Proactive Defense", "SIEM/SOAR Integration"],
    isNew: true,
    domain: "Organisational Controls",
    aiPrompt: `Key Requirements for ISO 27001:2022 Annex A 5.7 (Threat Intelligence):
- Documented Process: Organizations must implement a documented, consistent process to gather, analyze, and disseminate threat intelligence.
- Three Levels of Intelligence:
  * Strategic: High-level trends and threat actor tactics.
  * Operational: Specific tactics, techniques, and procedures (TTPs).
  * Tactical: Technical Indicators of Compromise (IoCs) such as IPs and file hashes.
- Proactive Defense: Information must be used to improve security posture and inform risk assessments, not just for reactive incident response.
- Actionable Insights: Information should be refined into actionable intelligence, ensuring it is relevant to the organization's specific threat landscape.
- Integration: Threat intelligence should be integrated into existing workflows, such as SIEM, SOAR, or threat modeling, to enhance decision-making.
Audit Evidence Required: Documented threat intelligence policy, evidence of threat feeds/sources, integration with SIEM/SOAR, risk assessment updates based on threat intel.`
  },
  { 
    id: 7, 
    title: "Annex A 6.1 - Screening", 
    description: "Background verification checks on all candidates for employment prior to joining the organization.",
    keyControls: ["Identity Verification", "Qualification Checks", "Employment History", "Criminal Records", "Credit Checks", "Ongoing Screening"],
    domain: "People Controls",
    aiPrompt: `Key Screening Requirements (ISO 27001:2022 Annex A 6.1):
- Proportionate Approach: Screening must be based on risk, relevant legislation, regulations, and ethics.
- Prior to Engagement: Checks must be completed before granting access to information systems.
- Scope: Covers full-time, part-time, temporary staff, and third-party suppliers.
- Key Verification Areas:
  * Identity verification (e.g., passport, driving license).
  * Academic and professional qualifications.
  * Employment history (references).
  * Criminal record checks (if permitted by law and relevant to the role).
  * Credit checks (for high-risk, finance-related roles).
- Ongoing Screening: Background checks should be repeated periodically or when there are significant changes to the risk profile of a role.
Necessary Documentation (PDF/Policy):
- Formal Personnel Screening Policy defining procedures, criteria, and responsible roles.
- Evidence of Compliance: Records showing screening was completed (audit logs, HR signed statements).
- Supplier Contracts: Evidence that screening requirements are included in third-party contracts.
Audit Failure Points: No documented screening procedures, no evidence retention, screening not tailored to role risk level.`
  },
  { 
    id: 8, 
    title: "Annex A 7.4 - Physical Security Monitoring", 
    description: "Premises shall be continuously monitored for unauthorised physical access attempts.",
    keyControls: ["CCTV Surveillance", "Intrusion Alarms", "Motion Detectors", "Contact Detectors", "Sound Detectors", "Alarm Configuration"],
    isNew: true,
    domain: "Physical Controls",
    aiPrompt: `ISO 27001:2022 Annex A 7.4 - Physical Security Monitoring Requirements:
- Purpose: Implement appropriate surveillance tools to detect and prevent external and internal intruders from entering restricted physical areas.
- Surveillance tools must protect against: Data theft, loss of information assets, financial damage, removal of removable media, malware infection, ransomware attacks.
Three Implementation Steps:
1. Video Monitoring System: CCTV cameras for continuous monitoring of restricted areas, with records of all entries and exits.
2. Intrusion Detection: Motion, sound, and contact detectors to alert security teams:
   * Contact detectors: Trigger alarm when unknown object contacts doors/windows.
   * Motion detectors: Alert when movement detected in range.
   * Sound detectors: Break glass detectors for intrusion attempts.
3. Alarm Configuration: Ensure all sensitive areas (external doors, windows, unoccupied areas, computer rooms) are within alarm range.
Surveillance System Types: CCTV cameras, security guards, intruder alarm systems, physical security management software.
Supplementary Guidance:
- Keep monitoring system design confidential.
- Implement measures to prevent remote disabling of systems.
- Alarm control panel in alarm-equipped area with safe exit access.
- Use tamper-proof detectors.
- Comply with data protection laws (GDPR) for surveillance recordings.`
  },
  { 
    id: 9, 
    title: "Annex A 8.18 - Use of Privileged Utility Programs", 
    description: "Restrict and tightly control use of utility programs that might be capable of overriding system and application controls.",
    keyControls: ["Identify & Restrict", "Authorization Controls", "Comprehensive Logging", "Just-in-Time Access", "Separation of Duties", "PAM Tools"],
    prevControl: "Annex A 9.4.4",
    domain: "Technological Controls",
    aiPrompt: `ISO 27001:2022 Annex A 8.18 - Use of Privileged Utility Programs:
- Purpose: Strict control over utility programs that can override system security (debuggers, admin tools) to prevent unauthorized changes, data breaches, and system instability.
Key Requirements & Implementation:
- Identify & Restrict: Identify all tools capable of bypassing controls (disk editors, network analyzers) and limit access.
- Authorization: Ensure privileged utilities are only used by authorized personnel, not from standard user accounts.
- Logging: Implement comprehensive, granular logging of all actions performed by these tools.
- Just-in-Time Access: Use Privileged Access Management (PAM) tools for temporary elevation of privileges.
- Separation of Duties: Users authorized to use utilities must be different from those who authorize their use.
Examples of Covered Programs:
- Backup and restore software
- Disk defragmenters and editor tools
- Network management and diagnostic tools (packet sniffers, SIEM)
- Debuggers and system modification tools
- Antivirus/anti-malware software
Audit Evidence Required:
- Policy/procedure defining authorized privileged utility programs.
- Access request logs and authorization records.
- Audit logs showing who used tools and when.
- Documentation of periodic reviews of user access rights.`
  },
  { 
    id: 10, 
    title: "Annex A 8.2 - Access Rights", 
    description: "Provision and revoke access rights to all users for all systems and services in accordance with policy.",
    keyControls: ["Formal Provisioning Process", "Owner Authorization", "Prompt Revocation", "Privileged Access Controls", "Periodic Reviews", "Privilege Creep Prevention"],
    prevControl: "Annex A 9.2.2",
    domain: "Technological Controls",
    aiPrompt: `ISO 27001 Annex A.9.2 (2013) / A.5.18 & A.8.2 (2022) - Access Rights Management:
- Purpose: Formal, documented process to manage user access rights including provisioning, reviewing, and revoking access.
Key Aspects:
- Provisioning Process: Formal process for granting and removing access for all users (employees and third parties).
- Authorization: Access must be authorized by system owners, with checks to ensure appropriateness for the role.
- Prompt Revocation: Access rights must be revoked immediately when users change roles or leave the organization.
- Privileged Access: Specific, strict controls needed for privileged access (system administrators) due to higher risk.
- Periodic Review: Access rights reviewed periodically to prevent "privilege creep" and ensure continued appropriateness.
Documentation Required:
- Central record or database of access privileges.
- Documented procedures for user access provisioning.
- Logs of changes to access rights.
- Evidence of periodic access reviews.
- Authorization records from system owners.
Note: In ISO 27001:2022, this control is covered under Annex A 5.18 (Access Rights) and A 5.15 (Access Control).`
  },
];

export default function Dashboard() {
  const [dragActive, setDragActive] = useState({});
  const [expandedPanels, setExpandedPanels] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [analyzing, setAnalyzing] = useState({});
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({});
  const [exporting, setExporting] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const fileInputRefs = useRef({});

  // Load existing analysis results on mount
  useEffect(() => {
    const fetchExistingAnalyses = async () => {
      try {
        const response = await api.get('/analyses/?status=completed');
        const analyses = response.results || response || [];
        
        // Get latest analysis for each checklist
        const latestByChecklist = {};
        analyses.forEach(analysis => {
          const cid = analysis.checklist_id;
          if (!latestByChecklist[cid] || new Date(analysis.created_at) > new Date(latestByChecklist[cid].created_at)) {
            latestByChecklist[cid] = analysis;
          }
        });
        
        setAnalysisResults(latestByChecklist);
      } catch (err) {
        console.error('Failed to fetch existing analyses:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchExistingAnalyses();
  }, []);

  // Calculate real compliance stats from analysis results
  const complianceStats = useMemo(() => {
    const results = Object.values(analysisResults);
    
    // Default sample values when no analysis exists
    if (results.length === 0) {
      return {
        overallScore: 68,
        controlsCompliant: 42,
        totalControls: 93,
        criticalGaps: 12,
        maturityLevel: 2,
        maturityLabel: 'Repeatable',
        isDefault: true
      };
    }
    
    // Calculate overall compliance score (average of all analysis scores)
    const totalScore = results.reduce((sum, r) => sum + (r.compliance_score || 0), 0);
    const overallScore = Math.round((totalScore / results.length) * 100);
    
    // Calculate compliant controls from control_scores
    let compliantControls = 0;
    let totalControlsAssessed = 0;
    
    results.forEach(r => {
      const controlScores = r.control_scores || {};
      Object.values(controlScores).forEach(score => {
        totalControlsAssessed++;
        if (score >= 0.7) compliantControls++; // 70%+ = compliant
      });
    });
    
    // Total ISO 27001:2022 Annex A controls = 93
    const totalControls = 93;
    // Extrapolate based on assessed controls
    const estimatedCompliant = totalControlsAssessed > 0 
      ? Math.round((compliantControls / totalControlsAssessed) * totalControls)
      : 0;
    
    // Count critical gaps (high priority)
    let criticalGaps = 0;
    results.forEach(r => {
      const gaps = r.gaps || [];
      gaps.forEach(gap => {
        const gapLower = gap.toLowerCase();
        if (gapLower.includes('missing') || gapLower.includes('no evidence') || gapLower.includes('not defined')) {
          criticalGaps++;
        }
      });
    });
    
    // Determine maturity level based on overall score
    let maturityLevel, maturityLabel;
    if (overallScore >= 90) {
      maturityLevel = 5;
      maturityLabel = 'Optimized';
    } else if (overallScore >= 75) {
      maturityLevel = 4;
      maturityLabel = 'Managed';
    } else if (overallScore >= 60) {
      maturityLevel = 3;
      maturityLabel = 'Defined';
    } else if (overallScore >= 40) {
      maturityLevel = 2;
      maturityLabel = 'Repeatable';
    } else if (overallScore > 0) {
      maturityLevel = 1;
      maturityLabel = 'Initial';
    } else {
      maturityLevel = 0;
      maturityLabel = 'Not Assessed';
    }
    
    return {
      overallScore,
      controlsCompliant: estimatedCompliant,
      totalControls,
      criticalGaps,
      maturityLevel,
      maturityLabel,
      isDefault: false
    };
  }, [analysisResults]);

  // Get top gaps for remediation section
  const topGaps = useMemo(() => {
    const allGaps = [];
    Object.values(analysisResults).forEach(result => {
      const gaps = result.gaps || [];
      gaps.forEach(gap => {
        const gapLower = gap.toLowerCase();
        let priority = 'medium';
        if (gapLower.includes('missing') || gapLower.includes('no evidence') || gapLower.includes('not defined')) {
          priority = 'high';
        } else if (gapLower.includes('partial') || gapLower.includes('consider') || gapLower.includes('enhance')) {
          priority = 'low';
        }
        allGaps.push({ text: gap, priority, checklist: result.checklist_title });
      });
    });
    
    // Sort by priority (high first)
    allGaps.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
    
    return allGaps.slice(0, 3); // Top 3 gaps
  }, [analysisResults]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const togglePanel = (id) => {
    setExpandedPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectFiles = (checklistId) => {
    if (fileInputRefs.current[checklistId]) {
      fileInputRefs.current[checklistId].click();
    }
  };

  const handleFileChange = async (e, checklistId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedExtensions = ['.pdf'];
    const validFiles = Array.from(files).filter(f =>
      allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklist_id', checklistId);

      try {
        await api.upload('/files/', formData);
        setUploadedFiles((prev) => ({
          ...prev,
          [checklistId]: [...(prev[checklistId] || []), file.name],
        }));
        // Auto-expand the panel to show uploaded file
        setExpandedPanels((prev) => ({ ...prev, [checklistId]: true }));
        alert(`${file.name} uploaded successfully for checklist ${checklistId}`);
      } catch (err) {
        console.error(err);
        alert(`Upload failed for ${file.name}: ` + (err.message || 'Unknown error'));
      }
    }
  };

  const handleDrop = async (e, checklistId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [checklistId]: false }));
    
    const dropped = e.dataTransfer.files;
    if (!dropped || dropped.length === 0) return;

    const allowedExtensions = ['.pdf'];
    const validFiles = Array.from(dropped).filter(f =>
      allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('checklist_id', checklistId);

      try {
        await api.upload('/files/', formData);
        setUploadedFiles((prev) => ({
          ...prev,
          [checklistId]: [...(prev[checklistId] || []), file.name],
        }));
        // Auto-expand the panel to show uploaded file
        setExpandedPanels((prev) => ({ ...prev, [checklistId]: true }));
        alert(`${file.name} uploaded successfully for checklist ${checklistId}`);
      } catch (err) {
        console.error(err);
        alert(`Upload failed for ${file.name}: ` + (err.message || 'Unknown error'));
      }
    }
  };

  const handleAnalyzeChecklist = async (checklistId) => {
    const files = uploadedFiles[checklistId];
    if (!files || files.length === 0) {
      alert('Please upload at least one file before analyzing.');
      return;
    }

    setAnalyzing((prev) => ({ ...prev, [checklistId]: true }));
    try {
      const checklist = checklists.find((c) => c.id === checklistId);
      const response = await api.post('/analyze/', {
        checklist_id: checklistId,
        checklist_title: checklist?.title,
        checklist_prompt: checklist?.aiPrompt || '',
        key_controls: checklist?.keyControls || [],
        files: files,
      });
      
      // Store the analysis result
      setAnalysisResults((prev) => ({ ...prev, [checklistId]: response }));
      
      // Show success with score
      const score = ((response.compliance_score || 0) * 100).toFixed(0);
      const status = response.compliance_status || 'completed';
      alert(`Analysis complete for ${checklist?.title}!\n\nCompliance Score: ${score}%\nStatus: ${status.replace('_', ' ').toUpperCase()}\n\nView detailed results in the Reports section.`);
      console.log('Analysis response:', response);
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAnalyzing((prev) => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleAnalyzeAll = async () => {
    // Check if any files are uploaded
    const totalFiles = Object.values(uploadedFiles).flat().length;
    if (totalFiles === 0) {
      alert('Please upload at least one file before analyzing.');
      return;
    }

    // Get checklists that have files
    const checklistsWithFiles = checklists.filter(
      (c) => uploadedFiles[c.id]?.length > 0
    );

    if (checklistsWithFiles.length === 0) {
      alert('No files uploaded for any checklist.');
      return;
    }

    setAnalyzingAll(true);
    const results = [];

    try {
      // Analyze each checklist that has files
      for (const checklist of checklistsWithFiles) {
        setAnalyzing((prev) => ({ ...prev, [checklist.id]: true }));
        
        try {
          const response = await api.post('/analyze/', {
            checklist_id: checklist.id,
            checklist_title: checklist.title,
            checklist_prompt: checklist.aiPrompt || '',
            key_controls: checklist.keyControls || [],
            files: uploadedFiles[checklist.id],
          });
          results.push({ checklist: checklist.title, checklistId: checklist.id, success: true, response });
          // Store individual result
          setAnalysisResults((prev) => ({ ...prev, [checklist.id]: response }));
        } catch (err) {
          console.error(`Analysis failed for ${checklist.title}:`, err);
          results.push({ checklist: checklist.title, checklistId: checklist.id, success: false, error: err.message });
        } finally {
          setAnalyzing((prev) => ({ ...prev, [checklist.id]: false }));
        }
      }

      // Summary of results
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;
      
      // Calculate average score
      const successfulResults = results.filter((r) => r.success);
      const avgScore = successfulResults.length > 0
        ? (successfulResults.reduce((sum, r) => sum + (r.response?.compliance_score || 0), 0) / successfulResults.length * 100).toFixed(0)
        : 0;
      
      if (failed === 0) {
        alert(`All ${successful} analyses completed!\n\nAverage Compliance Score: ${avgScore}%\n\nView detailed results in the Reports section.`);
      } else {
        alert(`Analysis complete: ${successful} succeeded, ${failed} failed.\n\nAverage Score: ${avgScore}%\n\nView results in the Reports section.`);
      }
      
      console.log('All analysis results:', results);
    } catch (err) {
      console.error('Analyze all failed:', err);
      alert('Analysis failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAnalyzingAll(false);
    }
  };

  const handleExportChecklist = async (checklistId) => {
    const checklist = checklists.find((c) => c.id === checklistId);
    
    // Check if there's an analysis result for this checklist
    if (!analysisResults[checklistId]) {
      alert(`Please analyze documents for "${checklist?.title}" before exporting.`);
      return;
    }
    
    setExporting((prev) => ({ ...prev, [checklistId]: true }));
    try {
      const orgName = user?.name || 'Organization';
      const endpoint = `/export-report/?checklist_ids=${checklistId}&organization=${encodeURIComponent(orgName)}`;
      const filename = `ISOGUARD_${checklist?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Report.pdf`;
      
      await api.downloadFile(endpoint, filename);
      
      alert(`Audit report for "${checklist?.title}" downloaded successfully!`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setExporting((prev) => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleExportAll = async () => {
    // Check if any analysis has been completed
    const completedAnalyses = Object.keys(analysisResults);
    if (completedAnalyses.length === 0) {
      alert('Please analyze at least one checklist before exporting.');
      return;
    }
    
    setExporting((prev) => ({ ...prev, all: true }));
    try {
      const orgName = user?.name || 'Organization';
      const checklistIds = completedAnalyses.join(',');
      const endpoint = `/export-report/?checklist_ids=${checklistIds}&organization=${encodeURIComponent(orgName)}`;
      
      await api.downloadFile(endpoint, `ISOGUARD_Full_Audit_Report_${orgName.replace(/\s+/g, '_')}.pdf`);
      
      alert(`Full audit report for ${completedAnalyses.length} checklist(s) downloaded!`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.message || 'Unknown error.'));
    } finally {
      setExporting((prev) => ({ ...prev, all: false }));
    }
  };

  // Calculate total uploaded files
  const totalUploadedFiles = Object.values(uploadedFiles).flat().length;
  const checklistsWithUploads = Object.keys(uploadedFiles).filter(
    (key) => uploadedFiles[key]?.length > 0
  ).length;

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400'; 
    if (score > 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const statsCards = [
    { 
      label: "Overall Score", 
      value: loadingStats ? '...' : `${complianceStats.overallScore}%`,
      color: getScoreColor(complianceStats.overallScore)
    },
    { 
      label: "Annex A Controls", 
      value: loadingStats ? '...' : `${complianceStats.controlsCompliant}/${complianceStats.totalControls}`,
      color: complianceStats.controlsCompliant >= 70 ? 'text-green-400' : complianceStats.controlsCompliant >= 40 ? 'text-yellow-400' : 'text-red-400'
    },
    { 
      label: "Critical Gaps", 
      value: loadingStats ? '...' : `${complianceStats.criticalGaps}`,
      color: complianceStats.criticalGaps === 0 ? 'text-green-400' : complianceStats.criticalGaps <= 5 ? 'text-yellow-400' : 'text-red-400'
    },
    { 
      label: "Maturity Level", 
      value: loadingStats ? '...' : `Level ${complianceStats.maturityLevel}`,
      color: complianceStats.maturityLevel >= 4 ? 'text-green-400' : complianceStats.maturityLevel >= 3 ? 'text-yellow-400' : 'text-orange-400'
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex md:flex-col bg-gradient-to-b from-red-900 to-red-950 text-white shadow-2xl">
        <div className="p-6 text-center">
          <img src={logo} alt="ISOGUARD Logo" className="mx-auto w-16 h-16 mb-2 rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight">ISOGUARD</h1>
          <p className="text-xs text-red-200 mt-1">ISO 27001 Validator</p>
        </div>
        <nav className="mt-6 flex-1 space-y-2">
          <Link to="/dashboard" className="block py-3 px-6 bg-red-600/90 rounded-full transition-colors">Overview</Link>
          <Link to="/gap-analysis" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Gap Analysis</Link>
          <Link to="/reports" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Reports</Link>
          <Link to="/settings" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Settings</Link>
        </nav>
        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {user && (
            <p className="text-sm text-gray-400 mb-2 truncate">
              {user.name || user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Compliance Dashboard</h2>
            <p className="text-red-200 text-sm">
              {user ? `Welcome , ${user.name || 'User'}!` : 'Real-time ISMS validation against ISO/IEC 27001:2022'}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportAll}
              disabled={exporting.all || Object.keys(analysisResults).length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 transition-all ${
                exporting.all || Object.keys(analysisResults).length === 0
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-br from-red-600 to-red-700 border border-red-500 hover:from-red-700 hover:to-red-800 text-white'
              }`}
              title={Object.keys(analysisResults).length === 0 ? 'Run analysis first to export report' : 'Export all completed analyses'}
            >
              {exporting.all ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All Reports (PDF)
                </>
              )}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border ${complianceStats.isDefault ? 'border-yellow-500/30' : 'border-white/10'}`}>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              {stat.label === 'Maturity Level' && !loadingStats && (
                <p className="text-xs text-gray-500 mt-1">{complianceStats.maturityLabel}</p>
              )}
              {complianceStats.isDefault && index === 0 && (
                <p className="text-xs text-yellow-400 mt-1">Sample Data</p>
              )}
            </div>
          ))}
        </div>
        {complianceStats.isDefault && !loadingStats && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-200 text-sm">
              Showing sample compliance data. Upload and analyze your ISMS documents to see your real compliance scores.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section with Accordion */}
          <section className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-900/70 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white">Validate New Evidence</h3>
              <button
                onClick={handleAnalyzeAll}
                disabled={analyzingAll || totalUploadedFiles === 0}
                className={`px-5 py-2 rounded-full font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                  analyzingAll || totalUploadedFiles === 0
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {analyzingAll ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing All...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze All Checklists
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-red-200 mb-2">Upload documents for each ISO 27001 checklist item below.</p>
            <p className="text-xs text-gray-400 mb-6">
              <span className="font-semibold text-white">{totalUploadedFiles}</span> file(s) uploaded across{' '}
              <span className="font-semibold text-white">{checklistsWithUploads}</span> checklist(s)
            </p>
            
            {/* Accordion Panels */}
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <div key={checklist.id} className="border border-white/20 rounded-xl overflow-hidden">
                  {/* Panel Header */}
                  <button
                    onClick={() => togglePanel(checklist.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-red-600 rounded-full text-sm font-bold">
                        {checklist.id}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{checklist.title}</p>
                          {checklist.isNew && (
                            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold">NEW</span>
                          )}
                          {checklist.prevControl && (
                            <span className="text-xs text-gray-500">← {checklist.prevControl}</span>
                          )}
                        </div>
                        {checklist.domain && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-red-300 bg-red-900/30 px-2 py-0.5 rounded">{checklist.domain}</span>
                            {checklist.annexes && (
                              <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">
                                {checklist.annexes.length} Controls: {checklist.annexes.slice(0, 3).join(', ')}{checklist.annexes.length > 3 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{checklist.description}</p>
                        {/* Key Controls Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {checklist.keyControls?.slice(0, 4).map((control, idx) => (
                            <span key={idx} className="text-xs bg-red-900/50 text-red-200 px-2 py-0.5 rounded">
                              {control}
                            </span>
                          ))}
                          {checklist.keyControls?.length > 4 && (
                            <span className="text-xs text-gray-500">+{checklist.keyControls.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFiles[checklist.id]?.length > 0 && (
                        <span className="text-xs bg-green-600 px-2 py-1 rounded-full">
                          {uploadedFiles[checklist.id].length} file(s)
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedPanels[checklist.id] ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Panel Content */}
                  {expandedPanels[checklist.id] && (
                    <div className="p-4 bg-gray-900/50">
                      <div
                        className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all border-2 ${
                          dragActive[checklist.id] ? 'border-red-500/70 bg-red-500/10' : 'border-white/10 bg-gray-800/50'
                        }`}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: true }));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: true }));
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragActive((prev) => ({ ...prev, [checklist.id]: false }));
                        }}
                        onDrop={(e) => handleDrop(e, checklist.id)}
                      >
                        <svg className="w-8 h-8 text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-300">Drag & drop files here</p>
                        <p className="text-xs text-gray-500 mt-1">PDF only (Max 50MB)</p>
                        <button
                          onClick={() => handleSelectFiles(checklist.id)}
                          className="mt-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg hover:from-red-700 hover:to-red-800 transition-all"
                        >
                          Select Files
                        </button>
                        <input
                          ref={(el) => (fileInputRefs.current[checklist.id] = el)}
                          type="file"
                          accept=".pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(e, checklist.id)}
                        />
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedFiles[checklist.id]?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-gray-400 font-semibold">Uploaded:</p>
                          {uploadedFiles[checklist.id].map((fileName, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{fileName}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Analyze and Export Buttons for this checklist */}
                      <div className="mt-4 flex justify-end gap-2">
                        {/* Export Button */}
                        <button
                          onClick={() => handleExportChecklist(checklist.id)}
                          disabled={exporting[checklist.id] || !analysisResults[checklist.id]}
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
                            exporting[checklist.id] || !analysisResults[checklist.id]
                              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                          }`}
                          title={!analysisResults[checklist.id] ? 'Run analysis first to export report' : 'Export PDF report'}
                        >
                          {exporting[checklist.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Export PDF
                            </>
                          )}
                        </button>
                        
                        {/* Analyze Button */}
                        <button
                          onClick={() => handleAnalyzeChecklist(checklist.id)}
                          disabled={analyzing[checklist.id] || !uploadedFiles[checklist.id]?.length}
                          className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all flex items-center gap-2 ${
                            analyzing[checklist.id] || !uploadedFiles[checklist.id]?.length
                              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                          }`}
                        >
                          {analyzing[checklist.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Analyze with AI
                            </>
                          )}
                        </button>
                      </div>

                      {/* Analysis Result Preview */}
                      {analysisResults[checklist.id] && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-white/10">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-white">Last Analysis Result</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              analysisResults[checklist.id].compliance_status === 'compliant' ? 'bg-green-500' :
                              analysisResults[checklist.id].compliance_status === 'partial' ? 'bg-yellow-500' :
                              'bg-red-500'
                            } text-white`}>
                              {((analysisResults[checklist.id].compliance_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          {analysisResults[checklist.id].summary && (
                            <p className="text-xs text-gray-300 mb-2">{analysisResults[checklist.id].summary.slice(0, 150)}...</p>
                          )}
                          <Link
                            to="/reports"
                            className="text-xs text-red-400 hover:text-red-300 underline"
                          >
                            View full report →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Remediation Priorities */}
          <section className="bg-white/10 p-6 rounded-3xl shadow-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Urgent Remediation</h3>
            <div className="space-y-4">
              {topGaps.length > 0 ? (
                topGaps.map((gap, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border-l-4 ${
                      gap.priority === 'high' ? 'bg-red-500/10 border-red-500' :
                      gap.priority === 'medium' ? 'bg-orange-500/10 border-orange-500' :
                      'bg-blue-500/10 border-blue-500'
                    }`}
                  >
                    <p className={`text-xs font-bold ${
                      gap.priority === 'high' ? 'text-red-400' :
                      gap.priority === 'medium' ? 'text-orange-400' :
                      'text-blue-400'
                    }`}>
                      {gap.priority.toUpperCase()} PRIORITY
                    </p>
                    <p className="text-sm text-gray-200 mt-1">{gap.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{gap.checklist}</p>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 bg-red-500/10 border-l-4 border-red-500">
                    <p className="text-xs font-bold text-red-400">HIGH PRIORITY</p>
                    <p className="text-sm text-gray-200 mt-1">Annex A.8.10: Information Deletion policy missing.</p>
                    <p className="text-xs text-gray-500 mt-1">A.8 Asset Management</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 border-l-4 border-orange-500">
                    <p className="text-xs font-bold text-orange-400">MEDIUM PRIORITY</p>
                    <p className="text-sm text-gray-200 mt-1">Clause 6.2: ISMS Objectives not documented.</p>
                    <p className="text-xs text-gray-500 mt-1">A.5 Information Security Policies</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500">
                    <p className="text-xs font-bold text-yellow-400">LOW PRIORITY</p>
                    <p className="text-sm text-gray-200 mt-1">Consider enhancing security awareness training frequency.</p>
                    <p className="text-xs text-gray-500 mt-1">A.7 Human Resource Security</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-blue-400">TIP</p>
                    <p className="text-sm text-gray-200 mt-1">Review Access Control logs for Annex A.8.3.</p>
                    <p className="text-xs text-gray-500 mt-1">A.9 Access Control</p>
                  </div>
                </>
              )}
              <Link 
                to="/gap-analysis" 
                className="block text-center text-sm text-red-400 hover:text-red-300 mt-4"
              >
                View all gaps →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
        