import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IAnalysis extends Document {
    userId: IUser['_id'];
    symptoms: string;
    files: Array<{
        name: string;
        type: string;
        data: string;
    }>;
    questions: Array<{
        q: string;
        a: string;
    }>;
    report: {
        diagnoses: Array<{
            disease: string;
            confidence: number;
        }>;
        triage: {
            urgency: 'RED' | 'YELLOW' | 'GREEN';
            message: string;
            whatToDoNow: string[];
            whatToAvoid: string[];
        };
        specialist: string;
        treatment: string[];
        medicalExplanation: string;
        simpleExplanation: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AnalysisSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    files: [{
        name: String,
        type: String,
        data: String
    }],
    questions: [{
        q: String,
        a: String
    }],
    report: {
        diagnoses: [{
            disease: String,
            confidence: Number
        }],
        triage: {
            urgency: {
                type: String,
                enum: ['RED', 'YELLOW', 'GREEN'],
                required: true
            },
            message: String,
            whatToDoNow: [String],
            whatToAvoid: [String]
        },
        specialist: String,
        treatment: [String],
        medicalExplanation: String,
        simpleExplanation: String
    }
}, {
    timestamps: true
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);