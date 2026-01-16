Multi-Agent Healthcare System using Google ADK
Overview
This project implements a multi-agent healthcare system using the Google Agent Development Kit (ADK).
It combines:
Medical diagnosis support
Parallel mental health monitoring
Safety & ethics checks
The system provides personalized, safe, and continuous care using specialized agents that collaborate in real time.
System Architecture
Our system consists of 3 MAIN AGENTS (as shown in our PPT):
1️⃣ Medical Agent Cluster
Responsible for:
Symptom analysis
Differential diagnosis
Personalized recommendations
Medical knowledge integration
Subagents inside Medical Cluster
Symptom Detective Agent
Clinical Reasoning Agent
Guidance Composer Agent
Knowledge Integration Agent
2️⃣ Mental Health Agent
Runs continuously in parallel with medical reasoning.
Responsible for:
Emotion detection
Stress & anxiety scoring
Crisis monitoring
Empathy & support
Subagents inside Mental Health Agent
Emotion Detection Agent
Stress & Anxiety Support Agent
Crisis Monitoring Agent
3️⃣ Safety & Ethics Guard Agent
Ensures the system remains safe and responsible.
Responsible for:
Medical safety checks
Risk detection
Emergency escalation
Overconfidence filtering
Subagents inside Safety Agent
Medical Safety Checker
Risk Detection Agent
Escalation Manager
Overconfidence Guard
Root Orchestrator
Although not counted as part of the "3 main agents,"
the Root Orchestrator controls the entire conversation:
Routes queries to the correct agent
Blends outputs
Ensures safety verification before returning the final answer
Tools Used (ADK Tools Layer)
The following tools support the agents:
Patient Memory Tool
Medical Guidelines Lookup Tool
Symptom Extraction Tool
Emotion Analysis Tool
Risk Analysis Tool
Longitudinal Learning Engine
Tools are implemented using Google ADK's tool interface.
Workflow (How the System Works)
1. User gives input
Example: “I have chest pain and feel stressed.”
2. Root Orchestrator activates
Sends request to:
Medical cluster
Mental health agent
Safety agent
3. Medical Agent Cluster
Symptom Detective → asks follow-up questions
Clinical Reasoning → generates possible conditions
Knowledge Integration → checks medical guidelines
Guidance Composer → creates safe recommendations
4. Mental Health Agent (Parallel)
Detects emotional distress
Provides stress-mitigating advice
Monitors crisis signals
5. Safety & Ethics Guard
Checks for emergencies
Ensures no harmful advice
Overrides system if needed
6. Final Response
Orchestrator merges:
Medical output
Mental health output
Safety validation
Patient’s historical context
7. Memory Update
Longitudinal engine stores:
Symptoms
Patterns
Episode history