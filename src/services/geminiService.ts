import { GoogleGenAI, Type } from "@google/genai";
import { MedicalReport } from "../types";
import { mockQuestions, mockReport } from './mockData';

// Initialize with API key from environment variable
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Helper to ensure we get a clean JSON string from the model response
 */
const cleanJsonResponse = (text: string): string => {
    // Remove potential markdown code blocks
    return text.replace(/```json\n?|```/g, "").trim();
};

export const generateQuestions = async (symptoms: string, files: any[]): Promise<string[]> => {
    console.log('Generating questions for:', symptoms.substring(0, 50) + '...');

    // For testing without API key, return mock questions
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.log('Using mock questions (no API key)');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockQuestions;
    }

    const parts: any[] = [{ text: `Symptoms: ${symptoms}\n\nTask: Generate exactly 10 clinical follow-up questions to refine a potential diagnosis. Be concise.` }];

    // Add file data if present
    files.forEach(file => {
        parts.push({
            inlineData: {
                data: file.data.split(',')[1], // Remove data: prefix
                mimeType: file.type
            }
        });
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Using flash model for speed
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["questions"]
                }
            }
        });

        const text = response.text || "";
        const data = JSON.parse(cleanJsonResponse(text));
        return data.questions || [];
    } catch (err) {
        console.error("Error in generateQuestions:", err);
        // Fallback to mock data on API error
        return mockQuestions;
    }
};

export const generateFinalReport = async (
    initialSymptoms: string,
    files: any[],
    questionAnswers: Array<{ q: string; a: string }>
): Promise<MedicalReport> => {
    console.log('Generating report for symptoms:', initialSymptoms.substring(0, 50) + '...');
    console.log('Answers provided:', questionAnswers.length);

    // For testing without API key, return mock report
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.log('Using mock report (no API key)');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return mockReport;
    }

    const qStr = questionAnswers.map(qa => `Q: ${qa.q}\nA: ${qa.a}`).join('\n');
    const prompt = `
    SYMPTOMS: ${initialSymptoms}
    ANSWERS: ${qStr}
    
    TASK: Provide a Medical Report JSON.
    1. Primary diagnosis (highest confidence integer 0-100).
    2. Exactly 2 alternative diagnoses (lower confidence integers).
    3. Treatment array (OTC meds, lifestyle).
    4. Triage (RED/YELLOW/GREEN).
    
    Be professional, concise, and accurate.
  `;

    const parts: any[] = [{ text: prompt }];
    files.forEach(file => {
        parts.push({
            inlineData: {
                data: file.data.split(',')[1],
                mimeType: file.type
            }
        });
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        diagnoses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    disease: { type: Type.STRING },
                                    confidence: { type: Type.INTEGER }
                                },
                                required: ["disease", "confidence"]
                            }
                        },
                        triage: {
                            type: Type.OBJECT,
                            properties: {
                                urgency: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
                                message: { type: Type.STRING },
                                whatToDoNow: { type: Type.ARRAY, items: { type: Type.STRING } },
                                whatToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["urgency", "message", "whatToDoNow", "whatToAvoid"]
                        },
                        specialist: { type: Type.STRING },
                        worseningScenario: { type: Type.STRING },
                        riskOfInaction: { type: Type.STRING },
                        medicalExplanation: { type: Type.STRING },
                        simpleExplanation: { type: Type.STRING },
                        symptomReasons: { type: Type.STRING },
                        treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
                        historyOfQuestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    q: { type: Type.STRING },
                                    a: { type: Type.STRING }
                                }
                            }
                        }
                    },
                    required: [
                        "diagnoses", "triage", "specialist", "worseningScenario",
                        "riskOfInaction", "medicalExplanation", "simpleExplanation", "symptomReasons", "treatment"
                    ]
                }
            }
        });

        const text = response.text || "";
        return JSON.parse(cleanJsonResponse(text)) as MedicalReport;
    } catch (err) {
        console.error("Error in generateFinalReport:", err);
        // Fallback to mock data on API error
        return mockReport;
    }
};