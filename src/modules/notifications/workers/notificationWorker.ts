import { Application_Worker } from '@src/config/redis/workers/worker.js';
import { EmailTransport } from '@src/config/node-mailer/node-mailer.js';

export function startNotificationWorker() {
        Application_Worker.create('EMAIL_NOTIFICATION', async (job) => {
                const { email, firstName, template, data, id } = job.data;

                console.log(`[Worker] Processing ${template} for ${email} (ID: ${id})`);

                const simpleBody = `
            <h3>Hello ${firstName},</h3>
            <p>This is a ${template} notification from JobBuddy AI.</p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;

                try {
                        await EmailTransport.sendMail({
                                email,
                                firstName,
                                subject: `JobBuddy AI: ${template.replace('_', ' ')}`,
                                body: simpleBody
                        });

                        console.log(`[Worker] Email sent successfully to ${email}`);
                } catch (error) {
                        console.error(`[Worker] Error sending email:`, error);
                        // Re-throw so BullMQ knows to retry based on your backoff settings
                        throw error;
                }
        });

        console.log('🚀 Notification Worker initialized and listening for jobs...');
}
