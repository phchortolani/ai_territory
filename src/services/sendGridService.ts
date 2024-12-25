
import sgMail from '@sendgrid/mail'
import { ReturnSolicitationDto } from '../dtos/returnSolicitation';
import { UserLogService } from './userLogService';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendReturnInfoMail(devolution: ReturnSolicitationDto[]) {
    /*   const msg = {
          to: 'phchortolani@gmail.com', // Change to your recipient
          from: 'aitab@lanisystems.com.br', // Change to your verified sender
          subject: 'Sending with SendGrid is Fun',
          text: 'and easy to do anywhere, even with Node.js',
          html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      }
  
      await sgMail.send(msg)
          .then(() => {
              console.log('Email sent')
          })
          .catch((error) => {
              console.error(error)
          })
   */
    const leaders_devolutions = devolution.map(x => {
        return { leader_name: x.leader.name + ' - ' + x?.devolutions.map(y => y.territories.map(z => z.id).join(', ')).join(', ') }
    })

    return await sendMailWithTemplate('phchortolani@gmail.com', 'd-2fb1d40560e14d96b9e001fada87e2dd', {
        name: 'Paulo',
        leaders: leaders_devolutions
    })
}
export async function sendMailWithTemplate(to: string, templateId: string, dynamicData: Record<string, unknown>, origin: string = 'cron', user: number = 1) {
    try {
        const msg = {
            to,
            from: 'aitab@lanisystems.com.br',
            templateId,
            dynamic_template_data: dynamicData,
        };

        const mail_info = await sgMail.send(msg);

        const mail_info_string = JSON.stringify(mail_info, null, 2);

        await new UserLogService({ user_id: user, action: `sended email with success.`, origin: origin, description: mail_info_string }).log();

        return 'Email enviado com sucesso!';
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        return `Erro ao enviar email: ${error}`;

    }
}