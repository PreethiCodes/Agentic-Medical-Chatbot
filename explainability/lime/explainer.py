# explainability/lime/explainer.py
from lime.lime_text import LimeTextExplainer
import shap

class LimeExplainer:
    def __init__(self, class_names=None):
        self.explainer = LimeTextExplainer(class_names=class_names)

    def explain(self, predict_fn, text, num_features=10):
        """
        predict_fn: function that returns probability scores
        text: input text to explain
        """
        exp = self.explainer.explain_instance(
            text_instance=text,
            classifier_fn=predict_fn,
            num_features=num_features
        )
        return exp.as_list()


class ShapExplainer:
    def __init__(self, model, tokenizer=None):
        self.model = model
        self.tokenizer = tokenizer

    def explain(self, input_text):
        """
        Simple SHAP wrapper using text tokenizer or model explainer
        """
        # tokenize text if needed
        if self.tokenizer:
            input_vector = self.tokenizer([input_text])
        else:
            input_vector = [input_text]

        explainer = shap.Explainer(self.model)
        shap_values = explainer(input_vector)
        return shap_values
