
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)



export async function sendReturnInfoMail() {
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
    sendMailWithTemplate('phchortolani@gmail.com', 'd-2fb1d40560e14d96b9e001fada87e2dd', {
        name: 'Paulo',
        leaders: [
            { leader_name: 'Geronimo - 1 ,2, 3 ,4' },
            { leader_name: 'Aléx -  8 ,5, 10 ,12' },
            { leader_name: 'Tonon - 45,42,2' }
        ]
    })
}
export async function sendMailWithTemplate(to: string, templateId: string, dynamicData: Record<string, unknown>) {
    const msg = {
        to, // Destinatário
        from: 'aitab@lanisystems.com.br', // Remetente verificado no SendGrid
        templateId, // ID do template do SendGrid
        dynamic_template_data: dynamicData, // Dados dinâmicos para o template
    };

    try {
        await sgMail.send(msg);
        console.log('Email enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao enviar email:', error);

    }
}