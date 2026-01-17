from .schemas import KnowledgeIntegrationOutput, ConditionInfo, MedicalSource

def format_output(model_output: dict) -> KnowledgeIntegrationOutput:
    return KnowledgeIntegrationOutput(
        conditions=[
            ConditionInfo(**condition)
            for condition in model_output.get("conditions", [])
        ],
        medical_sources=[
            MedicalSource(**source)
            for source in model_output.get("medical_sources", [])
        ]
    )
