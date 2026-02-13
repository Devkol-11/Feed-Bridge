import Express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { IdentityRoutes } from './modules/identity/http/routes/routes.js';
import { JobFeedIngestionRoutes } from './modules/jobIngesttion & catalog/presentation/http/routes/routes.js';
import { UserPreferenceRoutes } from './modules/userPreferences/http/routes/routes.js';
import { RecommendationRoutes } from './modules/reccomendations/presentation/routes.js';
import { JobTrackingRoutes } from './modules/jobTracking/presentation/routes.js';
import { AiAssistanceRoutes } from './modules/aiAssistance/presentation/routes.js';
import { AnalyticsRoutes } from './modules/analytics/presentation/routes.js';
import { applicationErrorHandler } from './shared/middleware/gloalErrorHandler.js';

export function initializeApplication(): Express.Application {
        const identityRoutes = IdentityRoutes();
        const jobFeedIngestionRoutes = JobFeedIngestionRoutes();
        const userPreferenceRoutes = UserPreferenceRoutes();
        const recommendationRoutes = RecommendationRoutes();
        const jobTrackingRoutes = JobTrackingRoutes();
        const aiAssistanceRoutes = AiAssistanceRoutes();
        const analyticsRoute = AnalyticsRoutes();

        const app = Express();
        const baseUrl = '/api/v1';

        app.use((req, _res, next) => {
                console.log(`Incoming: ${req.method} ${req.url}`);
                next();
        });

        app.use(Express.json());
        app.use(morgan('combined'));
        app.use(cors({ origin: '*' }));

        app.use(`${baseUrl}/identity`, identityRoutes);
        app.use(`${baseUrl}/jobFeeds`, jobFeedIngestionRoutes);
        app.use(`${baseUrl}/preference`, userPreferenceRoutes);
        app.use(`${baseUrl}/recommendation`, recommendationRoutes);
        app.use(`${baseUrl}/jobTracking`, jobTrackingRoutes);
        app.use(`${baseUrl}/aiAssistance`, aiAssistanceRoutes);
        app.use(`${baseUrl}/analytics`, analyticsRoute);

        app.use(applicationErrorHandler);
        return app;
}
