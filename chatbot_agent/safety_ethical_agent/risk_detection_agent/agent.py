from explainability.lime.explainer import LimeExplainer

lime_explainer = LimeExplainer(class_names=["none","low","medium","high","critical"])

def explain_risk_decision(user_input, risk_assessment):
    """
    Explain why the risk level was assigned using LIME
    """
    # Convert RiskDetectionAgent output to probability vector
    def fake_predict(texts):
        probs = []
        for t in texts:
            # Simple example: return fixed probabilities based on keyword presence
            lowered = t.lower()
            if any(k in lowered for k in ["kill myself", "suicide"]):
                probs.append([0,0,0,0,1])  # critical
            elif any(k in lowered for k in ["hurt me","abuse"]):
                probs.append([0,0,0,1,0])  # high
            else:
                probs.append([1,0,0,0,0])  # none
        return np.array(probs)

    explanation = lime_explainer.explain(fake_predict, user_input)
    return explanation
