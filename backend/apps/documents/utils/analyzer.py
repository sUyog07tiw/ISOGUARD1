"""
AI-powered document analyzer for ISO 27001 compliance checking.
"""

import logging
import json
import os
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# ISO 27001 Checklist definitions
ISO27001_CHECKLISTS = {
    1: {
        "id": 1,
        "title": "A.5 Information Security Policies",
        "controls": [
            "A.5.1 Management direction for information security",
            "A.5.1.1 Policies for information security",
            "A.5.1.2 Review of the policies for information security",
        ],
        "keywords": [
            "information security policy",
            "security policy",
            "policy review",
            "management commitment",
            "policy approval",
            "policy communication",
        ],
    },
    2: {
        "id": 2,
        "title": "A.6 Organization of Information Security",
        "controls": [
            "A.6.1 Internal organization",
            "A.6.1.1 Information security roles and responsibilities",
            "A.6.1.2 Segregation of duties",
            "A.6.1.3 Contact with authorities",
            "A.6.1.4 Contact with special interest groups",
            "A.6.1.5 Information security in project management",
            "A.6.2 Mobile devices and teleworking",
            "A.6.2.1 Mobile device policy",
            "A.6.2.2 Teleworking",
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
        ],
    },
    3: {
        "id": 3,
        "title": "A.7 Human Resource Security",
        "controls": [
            "A.7.1 Prior to employment",
            "A.7.1.1 Screening",
            "A.7.1.2 Terms and conditions of employment",
            "A.7.2 During employment",
            "A.7.2.1 Management responsibilities",
            "A.7.2.2 Information security awareness, education and training",
            "A.7.2.3 Disciplinary process",
            "A.7.3 Termination and change of employment",
            "A.7.3.1 Termination or change of employment responsibilities",
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
        ],
    },
    4: {
        "id": 4,
        "title": "A.8 Asset Management",
        "controls": [
            "A.8.1 Responsibility for assets",
            "A.8.1.1 Inventory of assets",
            "A.8.1.2 Ownership of assets",
            "A.8.1.3 Acceptable use of assets",
            "A.8.1.4 Return of assets",
            "A.8.2 Information classification",
            "A.8.2.1 Classification of information",
            "A.8.2.2 Labelling of information",
            "A.8.2.3 Handling of assets",
            "A.8.3 Media handling",
            "A.8.3.1 Management of removable media",
            "A.8.3.2 Disposal of media",
            "A.8.3.3 Physical media transfer",
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
        ],
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
            "A.9.2.4 Management of secret authentication information of users",
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
        ],
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
            
            # Combine all chunk content
            combined_content = "\n\n".join([
                chunk.get("content", "") for chunk in document_chunks
            ])
            
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
        
        prompt = f"""You are an expert ISO 27001 compliance auditor. Analyze the following audit report/document content against the ISO 27001 checklist item: "{checklist_title}".

The specific controls to evaluate are:
{controls_text}

Document Content:
{content[:15000]}

Please perform a thorough compliance analysis and provide your assessment in the following JSON format:
{{
    "compliance_status": "compliant" | "partial" | "non_compliant" | "not_applicable",
    "compliance_score": 0.0 to 1.0 (where 1.0 is fully compliant),
    "summary": "Executive summary of the compliance assessment (2-3 sentences)",
    "findings": [
        "Specific finding 1 with reference to document content",
        "Specific finding 2 with reference to document content"
    ],
    "recommendations": [
        "Actionable recommendation 1 to improve compliance",
        "Actionable recommendation 2 to address gaps"
    ],
    "gaps": [
        "Identified gap 1 in compliance coverage",
        "Identified gap 2 requiring attention"
    ],
    "comments": [
        "General observation about the audit report quality",
        "Comment on documentation completeness",
        "Suggestions for improving the audit report itself"
    ],
    "control_scores": {{
        "control_name": 0.0 to 1.0,
        "another_control": 0.0 to 1.0
    }}
}}

Be specific and reference the actual document content in your findings. Provide practical, actionable recommendations. Score each control individually where possible."""

        try:
            print(f"   \ud83c\udf10 Calling Azure OpenAI (deployment: {self.azure_deployment})...")
            
            response = self.client.chat.completions.create(
                model=self.azure_deployment,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert ISO 27001 compliance auditor with deep knowledge of information security management systems. Always respond with valid JSON. Provide detailed, specific, and actionable analysis."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_completion_tokens=4000
            )
            
            print(f"   \u2705 Azure OpenAI response received")
            
            result_text = response.choices[0].message.content
            print(f"   \ud83d\udcdd Response length: {len(result_text)} characters")
            
            result = json.loads(result_text)
            
            # Validate and normalize the result
            return self._normalize_result(result)
            
        except Exception as e:
            print(f"   \u274c Azure OpenAI error: {e}")
            logger.error(f"Azure OpenAI analysis failed: {e}")
            # Fall back to mock analysis
            print(f"   \u21a9\ufe0f  Falling back to mock analysis...")
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
        
        # Count keyword matches
        keyword_matches = sum(1 for kw in keywords if kw.lower() in content_lower)
        keyword_ratio = keyword_matches / len(keywords) if keywords else 0
        
        # Determine compliance status based on keyword coverage
        if keyword_ratio >= 0.7:
            compliance_status = "compliant"
            compliance_score = 0.7 + (keyword_ratio * 0.3)
        elif keyword_ratio >= 0.4:
            compliance_status = "partial"
            compliance_score = 0.4 + (keyword_ratio * 0.3)
        elif keyword_ratio > 0:
            compliance_status = "non_compliant"
            compliance_score = keyword_ratio * 0.4
        else:
            compliance_status = "not_applicable"
            compliance_score = 0.0
        
        # Generate findings based on matched keywords
        matched_keywords = [kw for kw in keywords if kw.lower() in content_lower]
        missing_keywords = [kw for kw in keywords if kw.lower() not in content_lower]
        
        findings = []
        if matched_keywords:
            findings.append(f"Document addresses the following topics: {', '.join(matched_keywords[:5])}")
        
        recommendations = []
        gaps = []
        
        if missing_keywords:
            gaps.append(f"Missing coverage for: {', '.join(missing_keywords[:5])}")
            recommendations.append(f"Consider adding documentation for: {', '.join(missing_keywords[:3])}")
        
        for control in controls[:3]:
            if not any(word in content_lower for word in control.lower().split()[:3]):
                gaps.append(f"Control '{control}' may not be adequately addressed")
                recommendations.append(f"Review and document compliance with '{control}'")
        
        summary = f"Analysis of '{checklist_title}' based on document review. "
        summary += f"Found {keyword_matches} of {len(keywords)} expected topics covered. "
        summary += f"Overall compliance score: {compliance_score:.1%}."
        
        # Generate comments for the audit report
        comments = [
            f"Document analyzed contains {len(content)} characters of content.",
            f"Keyword coverage: {keyword_ratio:.1%} of expected terms found.",
        ]
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
            "gaps": gaps[:5],
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
