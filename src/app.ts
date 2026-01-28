import Express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { IdentityRoutes } from './bounded-contexts/identity/infrastructure/http/routes/routes.js';
import { JobFeedIngestionRoutes } from './bounded-contexts/JobFeedIngestion/infrastructure/http/routes/routes.js';
import { applicationErrorHandler } from './shared/middleware/gloalErrorHandler.js';

export function initializeApplication(): Express.Application {
        const identityRoutes = IdentityRoutes();
        const jobFeedIngestionRoutes = JobFeedIngestionRoutes();

        const app = Express();

        app.use((req, _res, next) => {
                console.log(`Incoming: ${req.method} ${req.url}`);
                next();
        });

        app.use(Express.json());
        app.use(morgan('combined'));
        app.use(cors({ origin: '*' }));

        app.use('/api/v1/identity', identityRoutes);
        app.use('/api/v1/jobFeeds', jobFeedIngestionRoutes);

        app.use(applicationErrorHandler);
        return app;
}
