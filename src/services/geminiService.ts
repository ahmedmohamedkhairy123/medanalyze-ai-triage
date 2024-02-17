import { GoogleGenAI, Type } from "@google/genai";
import { MedicalReport } from "../types";

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
            model: 'gemini-1.5-flash', // Using flash model for speed
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
        throw new Error("The AI was unable to generate follow-up questions. Please check your connection and try again.");
    }
};

export const generateFinalReport = async (
    initialSymptoms: string,
    files: any[],
    questionAnswers: Array<{ q: string; a: string }>
): Promise<MedicalReport> => {
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
            model: 'gemini-1.5-flash',
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
        throw new Error("The AI failed to generate your medical report. This may be due to a high volume of requests or a network timeout. Please try again.");
    }
};