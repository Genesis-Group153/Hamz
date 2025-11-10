import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, inquiryType } = body;

    // Validate required fields
    if (!name || !email || !subject || !message || !inquiryType) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get Mailjet credentials from environment variables
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;
    const fromEmail = process.env.MAILJET_FROM_EMAIL || 'support@genesistickets.net';
    const fromName = process.env.MAILJET_FROM_NAME || 'Hamz Stadium Support';

    console.log('Checking Mailjet credentials...');
    console.log('API Key exists:', !!apiKey);
    console.log('API Secret exists:', !!apiSecret);
    console.log('From Email:', fromEmail);
    console.log('From Name:', fromName);

    if (!apiKey || !apiSecret) {
      console.error('Mailjet credentials not configured');
      console.error('API Key:', apiKey ? 'Set' : 'Missing');
      console.error('API Secret:', apiSecret ? 'Set' : 'Missing');
      return NextResponse.json(
        { error: 'Email service not configured. Please add MAILJET_API_KEY and MAILJET_API_SECRET to your .env.local file.' },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <hr style="border: none; border-top: 2px solid #2563eb; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 10px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Inquiry Type:</td>
              <td style="padding: 10px;">${inquiryType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Subject:</td>
              <td style="padding: 10px;">${subject}</td>
            </tr>
          </table>
          
          <h3 style="margin-top: 30px; color: #2563eb;">Message:</h3>
          <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
            ${message.replace(/\n/g, '<br />')}
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px; margin: 20px 0 0 0;">
            This email was sent from the Hamz Stadium contact form.
          </p>
        </body>
      </html>
    `;

    const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Inquiry Type: ${inquiryType}
Subject: ${subject}

Message:
${message}
    `;

    // Prepare Mailjet payload
    // Note: The To email should be the support team's email
    // Make sure this email is verified in your Mailjet account
    const toEmail = fromEmail; // Change this to your actual support email if different
    
    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName
          },
          To: [
            {
              Email: toEmail,
              Name: 'Support Team'
            }
          ],
          ReplyTo: {
            Email: email, // Use the customer's email as Reply-To
            Name: name
          },
          Subject: `Contact Form: ${subject}`,
          TextPart: emailText,
          HTMLPart: emailHtml,
          CustomID: `contact-form-${Date.now()}`
        }
      ]
    };

    console.log('Sending email via Mailjet...');
    console.log('From Email:', fromEmail);
    console.log('To Email:', toEmail);
    console.log('Reply-To:', email);
    
    // Send email via Mailjet API
    const mailjetResponse = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
      },
      body: JSON.stringify(mailjetPayload)
    });

    console.log('Mailjet response status:', mailjetResponse.status);

    if (!mailjetResponse.ok) {
      const errorData = await mailjetResponse.text();
      console.error('Mailjet API error - Status:', mailjetResponse.status);
      console.error('Mailjet API error - Body:', errorData);
      
      try {
        const parsedError = JSON.parse(errorData);
        console.error('Mailjet API error - Parsed:', parsedError);
        
        return NextResponse.json(
          { error: parsedError.ErrorMessage || 'Failed to send email', details: parsedError },
          { status: 500 }
        );
      } catch (e) {
        return NextResponse.json(
          { error: 'Failed to send email. Check console for details.', rawError: errorData },
          { status: 500 }
        );
      }
    }

    const result = await mailjetResponse.json();
    console.log('Mailjet API success:', result);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully',
        data: result 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}

