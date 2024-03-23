import { MedicalReport, UrgencyLevel } from '../types';

export const mockQuestions = [
    "How long have you been experiencing these symptoms?",
    "Is the pain constant or does it come and go?",
    "Have you taken any medication for this?",
    "Do you have any fever or chills?",
    "Have you experienced similar symptoms before?",
    "Is the pain sharp, dull, or burning?",
    "Does anything make the symptoms better or worse?",
    "Have you noticed any changes in appetite or weight?",
    "Are you experiencing any nausea or vomiting?",
    "Do you have any other medical conditions?"
];

export const mockReport: MedicalReport = {
    diagnoses: [
        { disease: "Acute Gastritis", confidence: 85 },
        { disease: "GERD (Gastroesophageal Reflux Disease)", confidence: 65 },
        { disease: "Peptic Ulcer", confidence: 45 }
    ],
    triage: {
        urgency: UrgencyLevel.YELLOW,
        message: "Moderate urgency - Consult a doctor within 24-48 hours",
        whatToDoNow: [
            "Take over-the-counter antacids",
            "Avoid spicy and acidic foods",
            "Stay hydrated with water",
            "Get adequate rest"
        ],
        whatToAvoid: [
            "Alcohol and caffeine",
            "NSAIDs like ibuprofen",
            "Large meals before bedtime",
            "Stressful situations"
        ]
    },
    specialist: "Gastroenterologist",
    worseningScenario: "If symptoms persist beyond 72 hours or if you experience vomiting blood, seek emergency care immediately.",
    riskOfInaction: "Untreated gastritis can lead to ulcers, bleeding, or increased risk of stomach cancer over time.",
    medicalExplanation: "Acute gastritis involves inflammation of the stomach lining, often caused by H. pylori infection, NSAID use, or excessive alcohol consumption.",
    simpleExplanation: "Your stomach lining is irritated and inflamed, causing the pain and nausea you're experiencing.",
    symptomReasons: "The upper abdominal pain is caused by stomach inflammation, while nausea results from gastric irritation affecting normal digestive function.",
    treatment: [
        "Antacids (Tums, Maalox) as needed",
        "Proton pump inhibitors (omeprazole) for 2 weeks",
        "Avoid triggering foods for 7-10 days",
        "Small, frequent meals instead of large ones"
    ],
    historyOfQuestions: []
};