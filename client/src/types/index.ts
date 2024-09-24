export interface SymptomInput {
    description: string;
    files: Array<{ name: string; type: string; data: string }>;
}

export interface Question {
    id: number;
    text: string;
    answer: string;
}

export interface Diagnosis {
    disease: string;
    confidence: number;
}

export enum UrgencyLevel {
    RED = "RED",
    YELLOW = "YELLOW",
    GREEN = "GREEN"
}

export interface MedicalReport {
    diagnoses: Diagnosis[];
    triage: {
        urgency: UrgencyLevel;
        message: string;
        whatToDoNow: string[];
        whatToAvoid: string[];
    };
    specialist: string;
    worseningScenario: string;
    riskOfInaction: string;
    medicalExplanation: string;
    simpleExplanation: string;
    symptomReasons: string;
    treatment: string[];
    historyOfQuestions: Array<{ q: string; a: string }>;
}

export type AppStep = 'LANDING' | 'SYMPTOMS' | 'QUESTIONNAIRE' | 'REPORT';