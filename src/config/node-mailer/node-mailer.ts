import { createTransport, type Transporter } from 'nodemailer';

export class EmailTransport  {
        private static transporter: Transporter;
        private static transportOptions: any;

        private constructor() {
                EmailTransport.transportOptions = {
                        host: '',
                        port: '',
                        auth: {
                                user: '',
                                pass: ''
                        }
                };

                EmailTransport.transporter = createTransport(EmailTransport.transportOptions);
        }

        static async sendMail(input: { email: string; subject: string; body: string }): Promise<void> {
                const mailOptions = {
                        from: '',
                        to: input.email,
                        subject: input.subject,
                        body: input.body
                };

                await EmailTransport.transporter.sendMail(mailOptions);
        }
}
