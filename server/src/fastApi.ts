import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
    origin: ['http://localhost:3000'],
    credentials: true
});

// Ultra-fast symptom checker (no AI, just pattern matching)
fastify.get('/fast-check/:symptoms', async (request: any, reply) => {
    const { symptoms } = request.params;
    const symptomsLower = symptoms.toLowerCase();

    // Fast pattern matching (microseconds response)
    const checks = {
        emergency: ['chest pain', 'difficulty breathing', 'unconscious', 'bleeding heavily', 'severe burn'],
        urgent: ['high fever', 'severe headache', 'vomiting blood', 'head injury'],
        moderate: ['cough', 'sore throat', 'mild fever', 'headache', 'stomach pain']
    };

    let urgency = 'GREEN';
    let message = 'Monitor symptoms';
    let recommendation = 'Rest and hydrate';

    // Check for emergency symptoms
    for (const symptom of checks.emergency) {
        if (symptomsLower.includes(symptom)) {
            urgency = 'RED';
            message = '⚠️ Seek EMERGENCY care immediately!';
            recommendation = 'Call emergency services or go to nearest ER';
            break;
        }
    }

    if (urgency === 'GREEN') {
        // Check for urgent symptoms
        for (const symptom of checks.urgent) {
            if (symptomsLower.includes(symptom)) {
                urgency = 'YELLOW';
                message = 'See a doctor within 24 hours';
                recommendation = 'Schedule urgent appointment';
                break;
            }
        }
    }

    return {
        success: true,
        data: {
            symptoms,
            urgency,
            message,
            recommendation,
            responseTime: `${Date.now() - request.startTime}ms`,
            note: 'Fast API endpoint - instant triage (not AI diagnosis)'
        }
    };
});

// Add timestamp to requests
fastify.addHook('onRequest', (request: any, reply, done) => {
    request.startTime = Date.now();
    done();
});

const startFastApi = async () => {
    try {
        await fastify.listen({ port: 5050, host: '0.0.0.0' });
        console.log('⚡ FastAPI running on port 5050');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

export default startFastApi;