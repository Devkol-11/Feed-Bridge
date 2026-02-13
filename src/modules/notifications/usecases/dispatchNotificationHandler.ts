import { NotificationDispatcher } from '@src/config/redis/jobQueue/Queue.js';
import { NotificationRepo } from '@src/modules/notifications/repository/notificationRepository.js';
import { randomUUID } from 'node:crypto';

export class DispatchNotification {
        private dispatcher = new NotificationDispatcher();

        async execute(command: { userId: string; type: string; payload: any }) {
                const user = await NotificationRepo.findAlertsEnabledUser(command.userId);

                if (!user) {
                        console.log(
                                `Notification skipped: User ${command.userId} not found or alerts disabled.`
                        );
                        return;
                }

                await this.dispatcher.dispatch(command.type, {
                        id: randomUUID(),
                        userId: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        template: command.type.toLowerCase(),
                        data: command.payload
                });
        }
}
