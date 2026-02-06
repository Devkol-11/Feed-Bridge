import Express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { IdentityRoutes } from './bounded-contexts/identity/presentation/http/routes/routes.js';
import { JobFeedIngestionRoutes } from './bounded-contexts/jobIngesttion & catalog/presentation/http/routes/routes.js';
import { UserPreferenceRoutes } from './bounded-contexts/userPreferences/presentation/routes/routes.js';
import { applicationErrorHandler } from './shared/middleware/gloalErrorHandler.js';

export function initializeApplication(): Express.Application {
        const identityRoutes = IdentityRoutes();
        const jobFeedIngestionRoutes = JobFeedIngestionRoutes();
        const userPreferenceRoutes = UserPreferenceRoutes();

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

        app.use(applicationErrorHandler);
        return app;
}
