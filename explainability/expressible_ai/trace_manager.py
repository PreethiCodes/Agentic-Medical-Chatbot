from .loger import ExpressibleLogger

class TraceManager:

    @staticmethod
    def symptom_trace(input_text, symptoms, confidence, evidence, method="LLM"):
        ExpressibleLogger.log({
            "step": "symptom_detection",
            "input_text": input_text,
            "symptoms_detected": symptoms,
            "confidence": confidence,
            "method": method,
            "evidence": evidence
        }, filename="symptom_traces.json")


    @staticmethod
    def reasoning_trace(symptoms, reasoning, rules, conditions, confidence):
        ExpressibleLogger.log({
            "step": "clinical_reasoning",
            "symptoms_used": symptoms,
            "reasoning_summary": reasoning,
            "rules_triggered": rules,
            "possible_conditions": conditions,
            "confidence": confidence
        }, filename="reasoning_traces.json")


    @staticmethod
    def risk_trace(risk_level, factors, patterns, segments, confidence):
        ExpressibleLogger.log({
            "step": "risk_evaluation",
            "risk_level": risk_level,
            "risk_factors": factors,
            "triggered_patterns": patterns,
            "extracted_text_segments": segments,
            "confidence": confidence
        }, filename="risk_traces.json")


    @staticmethod
    def safety_trace(query, violation, policy, action, confidence):
        ExpressibleLogger.log({
            "step": "safety_filter",
            "user_query": query,
            "violation_detected": violation,
            "policy_triggered": policy,
            "final_action": action,
            "confidence": confidence
        }, filename="safety_traces.json")
