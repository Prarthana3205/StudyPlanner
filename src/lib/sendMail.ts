import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

export async function sendMail({ to, subject, text, html }: EmailOptions): Promise<EmailResult> {
  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  
  if (!emailUser || !emailPass) {
    console.log('🔧 Email credentials not configured. Email would be sent to:', to);
    console.log('📧 Subject:', subject);
    console.log('📝 Content:', text);
    console.log('💡 OTP for development:', text.match(/\d{6}/)?.[0]);
    console.log('---');
    // For development, just log the email instead of failing
    return { success: true, message: 'Email logged to console (no SMTP configured)' };
  }

  try {
    console.log('📤 Attempting to send email to:', to);
    console.log('👤 Using email user:', emailUser);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    // Verify transporter configuration
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const result = await transporter.sendMail({
      from: `"StudyPlanner" <${emailUser}>`,
      to,
      subject,
      text,
      html: html || text, // Use HTML if provided, fallback to text
    });
    
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('Email sending failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
}
