# Expressible AI Module

This module provides a unified explainability layer for the entire agentic medical system.

## Components

### 1. Schemas
Defines the structure for:
- Symptom detection traces  
- Clinical reasoning traces  
- Risk evaluation traces  
- Safety and ethics traces  

### 2. Logger
Handles writing JSON logs into `/logs/`.

### 3. Trace Manager
Provides simplified functions that each agent can call to record:
- Symptom extraction  
- Clinical reasoning logic  
- Risk detection  
- Safety rule application  

## Usage

Import inside any agent:

```python
from explainability.expressible_ai.trace_manager import TraceManager
