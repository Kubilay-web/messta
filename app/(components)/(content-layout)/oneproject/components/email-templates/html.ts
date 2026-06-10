interface EmailProps {
  recipientName: string;
  subject: string;
  body: string;
}

export function sendGeneralEmail({
  recipientName,
  subject,
  body,
}: EmailProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <header style="background-color: #0056b3; padding: 20px; text-align: center;">
        <img src="https://via.placeholder.com/150x50?text=Company+Logo" alt="Company Logo" style="max-width: 150px;">
      </header>
      <main style="padding: 20px; background-color: #f9f9f9;">
        <h1 style="color: #0056b3;">${subject}</h1>
        <p style="font-size: 1.1em;">Dear ${recipientName},</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          ${body}
        </div>
      </main>
      <footer style="text-align: center; padding: 20px; font-size: 0.8em; color: #666;">
        <p>&copy; 2024 Your Company Name. All rights reserved.</p>
        <p>123 Business Street, City, Country</p>
      </footer>
    </body>
    </html>
  `;
}

export function sendToEmailList({
  recipientName,
  subject,
  body,
}: EmailProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <header style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Newsletter</h1>
      </header>
      <main style="padding: 20px; background-color: #ffffff;">
        <h2 style="color: #4CAF50;">${subject}</h2>
        <p style="font-size: 1.1em;">Hello ${recipientName},</p>
        <div style="border-left: 4px solid #4CAF50; padding-left: 20px; margin: 20px 0;">
          ${body}
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background-color: #4CAF50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Read More</a>
        </div>
      </main>
      <footer style="text-align: center; padding: 20px; font-size: 0.8em; color: #666; background-color: #f1f1f1;">
        <p>&copy; 2024 Your Company Name. All rights reserved.</p>
        <p>
          <a href="#" style="color: #4CAF50; text-decoration: none;">Unsubscribe</a> |
          <a href="#" style="color: #4CAF50; text-decoration: none;">Update Preferences</a>
        </p>
      </footer>
    </body>
    </html>
  `;
}

export function sendToClientList({
  recipientName,
  subject,
  body,
}: EmailProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <header style="background-color: #2c3e50; padding: 20px; text-align: center;">
        <img src="https://via.placeholder.com/150x50?text=Company+Logo" alt="Company Logo" style="max-width: 150px;">
      </header>
      <main style="padding: 20px; background-color: #ecf0f1;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">${subject}</h1>
        <p style="font-size: 1.1em;">Dear ${recipientName},</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          ${body}
        </div>
        <div style="margin-top: 30px; text-align: center;">
          <a href="#" style="background-color: #3498db; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contact Us</a>
        </div>
      </main>
      <footer style="text-align: center; padding: 20px; font-size: 0.8em; color: #7f8c8d; background-color: #2c3e50;">
        <p style="color: #ecf0f1;">&copy; 2024 Your Company Name. All rights reserved.</p>
        <p>
          <a href="#" style="color: #3498db; text-decoration: none;">Privacy Policy</a> |
          <a href="#" style="color: #3498db; text-decoration: none;">Terms of Service</a>
        </p>
      </footer>
    </body>
    </html>
  `;
}
