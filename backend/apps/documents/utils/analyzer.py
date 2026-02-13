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
    Analyzes documents against ISO 27001 checklists using AI.
    """
    
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.use_openai = bool(self.openai_api_key)
        
        if self.use_openai:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
                logger.info("OpenAI client initialized successfully")
            except ImportError:
                logger.warning("OpenAI package not installed. Using mock analysis.")
                self.use_openai = False
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}. Using mock analysis.")
                self.use_openai = False
        else:
            logger.info("No OpenAI API key found. Using mock analysis.")
    
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
            
            # Combine all chunk content
            combined_content = "\n\n".join([
                chunk.get("content", "") for chunk in document_chunks
            ])
            
            if not combined_content.strip():
                analysis_result.status = AnalysisResult.Status.FAILED
                analysis_result.error_message = "No document content to analyze"
                analysis_result.save()
                return False
            
            # Perform analysis
            if self.use_openai:
                result = self._analyze_with_openai(
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
            
            # Update the analysis result
            analysis_result.compliance_status = result.get("compliance_status")
            analysis_result.compliance_score = result.get("compliance_score", 0.0)
            analysis_result.summary = result.get("summary", "")
            analysis_result.findings = result.get("findings", [])
            analysis_result.recommendations = result.get("recommendations", [])
            analysis_result.gaps = result.get("gaps", [])
            analysis_result.status = AnalysisResult.Status.COMPLETED
            analysis_result.completed_at = timezone.now()
            analysis_result.save()
            
            return True
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            analysis_result.status = AnalysisResult.Status.FAILED
            analysis_result.error_message = str(e)
            analysis_result.save()
            return False
    
    def _analyze_with_openai(
        self,
        content: str,
        checklist_info: Dict,
        checklist_title: str
    ) -> Dict[str, Any]:
        """Use OpenAI to analyze the document content."""
        
        controls = checklist_info.get("controls", [])
        controls_text = "\n".join([f"- {c}" for c in controls])
        
        prompt = f"""You are an ISO 27001 compliance expert. Analyze the following document content against the ISO 27001 checklist item: "{checklist_title}".

The specific controls to check are:
{controls_text}

Document Content:
{content[:15000]}  # Limit content length for API

Please provide your analysis in the following JSON format:
{{
    "compliance_status": "compliant" | "partial" | "non_compliant" | "not_applicable",
    "compliance_score": 0.0 to 1.0,
    "summary": "Brief summary of the compliance assessment",
    "findings": ["Finding 1", "Finding 2", ...],
    "recommendations": ["Recommendation 1", "Recommendation 2", ...],
    "gaps": ["Gap 1", "Gap 2", ...]
}}

Be specific and reference the actual document content in your findings."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an ISO 27001 compliance auditor. Always respond with valid JSON."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            # Validate and normalize the result
            return self._normalize_result(result)
            
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {e}")
            # Fall back to mock analysis
            return self._analyze_mock(content, checklist_info, checklist_title)
    
    def _analyze_mock(
        self,
        content: str,
        checklist_info: Dict,
        checklist_title: str
    ) -> Dict[str, Any]:
        """
        Perform mock analysis when OpenAI is not available.
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
        
        return {
            "compliance_status": compliance_status,
            "compliance_score": round(compliance_score, 2),
            "summary": summary,
            "findings": findings[:5],
            "recommendations": recommendations[:5],
            "gaps": gaps[:5],
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
        
        return {
            "compliance_status": status,
            "compliance_score": round(score, 2),
            "summary": str(result.get("summary", ""))[:2000],
            "findings": list(result.get("findings", []))[:10],
            "recommendations": list(result.get("recommendations", []))[:10],
            "gaps": list(result.get("gaps", []))[:10],
        }
