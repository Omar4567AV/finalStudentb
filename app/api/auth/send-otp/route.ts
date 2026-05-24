import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body || !body.email) {
      return NextResponse.json({ error: "Target email address is required." }, { status: 400 });
    }

    const { email } = body;
    const cleanTargetEmail = email.trim().toLowerCase();

    // ✅ FIXED: Credentials are now correctly passed as clean, valid string literals
    const gmailUser = "ohalabi69@gmail.com";
    const gmailAppPass = "aiflnwbkgyyatjav"; // Your secure 16-character Google App Password

    // Initialize the secure Gmail SMTP transport node
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
    });

    // Generate a randomized 6-digit passcode string
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`📨 [Gmail SMTP] Dispatching OTP (${otpCode}) from ohalabi69@gmail.com to: ${cleanTargetEmail}`);

    const mailOptions = {
      from: `"EduPortal System" <${gmailUser}>`, // ✅ FIXED syntax layout check
      to: cleanTargetEmail,
      subject: "Your Secure Identity Verification Code",
      html: `
        <div style="font-family: system-ui, sans-serif; padding: 32px; max-width: 480px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff;">
          <h2 style="font-size: 22px; font-weight: 700; color: #000000; margin-bottom: 8px; tracking-tight: -0.025em;">Verify Your Identity</h2>
          <p style="font-size: 14px; color: #71717a; margin-bottom: 24px; line-height: 1.5;">Use the following one-time passcode to complete your portal sign-in session framework operation.</p>
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; text-align: center; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #000000; font-family: monospace; margin-bottom: 24px;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4; margin-top: 16px;">
            If you did not initiate this validation sequence request, you can safely ignore this security message. 
            This passcode will expire shortly.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: "One-time passcode dispatched successfully via Gmail!",
      devCode: otpCode 
    });

  } catch (error: any) {
    console.error("❌ Fatal Gmail SMTP transmission failure:", error);
    return NextResponse.json(
      { error: "Internal server SMTP connection error.", details: error.message },
      { status: 500 }
    );
  }
}