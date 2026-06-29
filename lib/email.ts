import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(email: string, orderId: string) {
  try {
    const data = await resend.emails.send({
      from: 'Surya Cloth <orders@suryacloth.com>', // Ensure this domain is verified in Resend
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div>
          <h1>Thank you for your order!</h1>
          <p>Your order <strong>${orderId}</strong> has been successfully placed and is being processed.</p>
          <p>We will notify you once it ships.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
