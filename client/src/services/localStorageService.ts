import { MedicalReport } from '../types';

interface LocalAnalysis {
    id: string;
    symptoms: string;
    report: MedicalReport;
    date: string;
    userId?: string;
}

class LocalStorageService {
    private readonly ANALYSES_KEY = 'medanalyze_analyses';
    private readonly USER_KEY = 'medanalyze_user';

    // Save analysis to localStorage
    saveAnalysis(symptoms: string, report: MedicalReport): string {
        const analyses = this.getAnalyses();
        const newAnalysis: LocalAnalysis = {
            id: `local-${Date.now()}`,
            symptoms,
            report,
            date: new Date().toISOString(),
            userId: 'local-user'
        };

        analyses.unshift(newAnalysis); // Add to beginning
        localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(analyses));

        console.log('✅ Analysis saved to localStorage:', newAnalysis.id);
        return newAnalysis.id;
    }

    // Get all analyses
    getAnalyses(): LocalAnalysis[] {
        try {
            const data = localStorage.getItem(this.ANALYSES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading analyses:', error);
            return [];
        }
    }

    // Get single analysis
    getAnalysis(id: string): LocalAnalysis | null {
        return this.getAnalyses().find(a => a.id === id) || null;
    }

    // Delete analysis
    deleteAnalysis(id: string): void {
        const analyses = this.getAnalyses().filter(a => a.id !== id);
        localStorage.setItem(this.ANALYSES_KEY, JSON.stringify(analyses));
    }

    // Clear all data
    clearAll(): void {
        localStorage.removeItem(this.ANALYSES_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    // Mock authentication (no API needed)
    mockLogin(email: string, password: string): boolean {
        try {
            const user = {
                id: 'local-user-' + Date.now(),
                name: email.split('@')[0] || 'User',
                email,
                role: 'patient',
                token: 'mock-jwt-token-' + Date.now()
            };

            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            localStorage.setItem('token', user.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    mockRegister(name: string, email: string, password: string): boolean {
        return this.mockLogin(email, password);
    }

    getCurrentUser(): any {
        try {
            const user = localStorage.getItem(this.USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    }

    logout(): void {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem(this.USER_KEY);
    }

    // Export analysis as downloadable JSON file
    exportAnalysis(id: string): void {
        const analysis = this.getAnalysis(id);
        if (!analysis) {
            alert('Analysis not found');
            return;
        }

        const data = {
            ...analysis,
            exportDate: new Date().toISOString(),
            source: 'MedAnalyze AI Triage',
            note: 'Share this file with your healthcare provider'
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `medanalyze-report-${id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Export as text for sharing
    exportAsText(id: string): string {
        const analysis = this.getAnalysis(id);
        if (!analysis) return '';

        return `
MEDANALYZE AI TRIAGE REPORT
============================
Report ID: ${id}
Date: ${new Date(analysis.date).toLocaleDateString()}

SYMPTOMS:
${analysis.symptoms}

PRIMARY DIAGNOSIS:
${analysis.report.diagnoses[0]?.disease || 'Unknown'} (${analysis.report.diagnoses[0]?.confidence || 0}% confidence)

TRIAGE LEVEL: ${analysis.report.triage.urgency}
${analysis.report.triage.message}

RECOMMENDED SPECIALIST:
${analysis.report.specialist}

TREATMENT:
${analysis.report.treatment.map((t, i) => `${i + 1}. ${t}`).join('\n')}

EXPORTED ON: ${new Date().toLocaleDateString()}
    `.trim();
    }

    // Get statistics
    getStats() {
        const analyses = this.getAnalyses();
        return {
            total: analyses.length,
            byUrgency: {
                RED: analyses.filter(a => a.report.triage.urgency === 'RED').length,
                YELLOW: analyses.filter(a => a.report.triage.urgency === 'YELLOW').length,
                GREEN: analyses.filter(a => a.report.triage.urgency === 'GREEN').length
            },
            latest: analyses.length > 0 ? analyses[0].date : null,
            oldest: analyses.length > 0 ? analyses[analyses.length - 1].date : null
        };
    }
}

// Export as singleton
const localStorageService = new LocalStorageService();
export default localStorageService;