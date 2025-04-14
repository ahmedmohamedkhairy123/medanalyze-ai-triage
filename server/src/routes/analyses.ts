import express from 'express';
import Analysis from '../models/Analysis';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const authenticate = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.userId = decoded.userId;
        next();
    } catch (error: any) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   POST /api/analysis
// @desc    Save a new analysis
// @access  Private
router.post('/', authenticate, async (req: any, res) => {
    try {
        const { symptoms, files, questions, report } = req.body;

        const analysis = await Analysis.create({
            userId: req.userId,
            symptoms,
            files: files || [],
            questions: questions || [],
            report
        });

        res.status(201).json({
            success: true,
            analysis: {
                id: analysis._id,
                createdAt: analysis.createdAt,
                diagnoses: analysis.report.diagnoses
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/analysis
// @desc    Get user's analysis history
// @access  Private
router.get('/', authenticate, async (req: any, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('symptoms report.diagnoses report.triage.urgency createdAt');

        res.json({
            success: true,
            analyses: analyses.map(a => ({
                id: a._id,
                symptoms: a.symptoms.substring(0, 100) + (a.symptoms.length > 100 ? '...' : ''),
                primaryDiagnosis: a.report.diagnoses[0]?.disease || 'Unknown',
                confidence: a.report.diagnoses[0]?.confidence || 0,
                urgency: a.report.triage.urgency,
                date: a.createdAt
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/analysis/:id
// @desc    Get single analysis by ID
// @access  Private
router.get('/:id', authenticate, async (req: any, res) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        res.json({
            success: true,
            analysis
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/analysis/:id/share
// @desc    Generate shareable link for doctor
// @access  Private
router.post('/:id/share', authenticate, async (req: any, res) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        // Generate share token (valid for 7 days)
        const shareToken = jwt.sign(
            { analysisId: analysis._id },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        // In production, this would be a real URL
        const shareUrl = `http://localhost:3000/share/${shareToken}`;

        res.json({
            success: true,
            shareUrl,
            shareToken,
            expiresIn: '7 days'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/analysis/shared/:token
// @desc    Get shared analysis (no auth required)
// @access  Public
router.get('/shared/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET as string) as any;

        const analysis = await Analysis.findById(decoded.analysisId)
            .populate('userId', 'name email');

        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }

        res.json({
            success: true,
            analysis,
            sharedBy: analysis.userId,
            isShared: true
        });
    } catch (error: any) {
        res.status(401).json({ error: 'Invalid or expired share link' });
    }
});

export default router;