import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  adminEmail: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  hospitalLocation: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  paymentMethod: string;
  paymentStatus: string;
  membershipPlan?: string;
  discountApplied?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingNotificationRequest = await req.json();
    
    const {
      adminEmail,
      patientName,
      patientEmail,
      doctorName,
      doctorSpecialty,
      hospitalName,
      hospitalLocation,
      appointmentDate,
      appointmentTime,
      consultationFee,
      paymentMethod,
      paymentStatus,
      membershipPlan,
      discountApplied,
    } = data;

    const paymentBadgeColor = paymentStatus === 'paid' ? '#10b981' : '#f59e0b';
    const paymentBadgeText = paymentStatus === 'paid' ? 'PAID' : 'PENDING';

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 20px;">
                      <span style="color: #ffffff; font-size: 12px; font-weight: 600; letter-spacing: 1px;">NEW BOOKING</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px;">Appointment Confirmed</h1>
                    <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">A new appointment has been scheduled</p>
                  </td>
                  <td align="right" valign="top">
                    <div style="background-color: ${paymentBadgeColor}; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                      ${paymentBadgeText}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Date & Time Banner -->
          <tr>
            <td style="background-color: #f0f9ff; padding: 24px 40px; border-bottom: 1px solid #e0f2fe;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%">
                    <div style="display: flex; align-items: center;">
                      <div style="background-color: #0ea5e9; width: 44px; height: 44px; border-radius: 12px; display: inline-block; text-align: center; line-height: 44px; margin-right: 16px;">
                        <span style="color: #ffffff; font-size: 20px;">📅</span>
                      </div>
                      <div style="display: inline-block; vertical-align: middle;">
                        <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                        <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${appointmentDate}</p>
                      </div>
                    </div>
                  </td>
                  <td width="50%">
                    <div style="display: flex; align-items: center;">
                      <div style="background-color: #0ea5e9; width: 44px; height: 44px; border-radius: 12px; display: inline-block; text-align: center; line-height: 44px; margin-right: 16px;">
                        <span style="color: #ffffff; font-size: 20px;">⏰</span>
                      </div>
                      <div style="display: inline-block; vertical-align: middle;">
                        <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Time</p>
                        <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${appointmentTime}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Patient Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h2 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      👤 Patient Details
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Name</p>
                          <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${patientName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Email</p>
                          <p style="color: #0f172a; font-size: 16px; font-weight: 500; margin: 4px 0 0;">${patientEmail}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Doctor Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h2 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      🩺 Doctor Details
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="60%">
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Doctor</p>
                          <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${doctorName}</p>
                        </td>
                        <td width="40%">
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Specialty</p>
                          <p style="color: #0ea5e9; font-size: 14px; font-weight: 600; margin: 4px 0 0;">${doctorSpecialty}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Hospital Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h2 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      🏥 Hospital Details
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Hospital</p>
                          <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 4px 0 0;">${hospitalName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="color: #64748b; font-size: 12px; margin: 0;">Location</p>
                          <p style="color: #0f172a; font-size: 14px; margin: 4px 0 0;">${hospitalLocation}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h2 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      💳 Payment Details
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Consultation Fee</p>
                              </td>
                              <td align="right">
                                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">₹${consultationFee}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${membershipPlan && discountApplied ? `
                      <tr>
                        <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="color: #fbbf24; font-size: 12px; margin: 0;">👑 ${membershipPlan} Discount (${discountApplied}%)</p>
                              </td>
                              <td align="right">
                                <p style="color: #10b981; font-size: 14px; font-weight: 600; margin: 0;">-₹${Math.round((consultationFee * discountApplied) / 100)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding-top: 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td>
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Payment Method</p>
                                <p style="color: #ffffff; font-size: 14px; font-weight: 500; margin: 4px 0 0;">
                                  ${paymentMethod === 'online' ? '💳 Online Payment' : '🏥 Pay at Hospital'}
                                </p>
                              </td>
                              <td align="right" valign="bottom">
                                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0;">Total Amount</p>
                                <p style="color: #10b981; font-size: 24px; font-weight: 700; margin: 4px 0 0;">₹${membershipPlan && discountApplied ? consultationFee - Math.round((consultationFee * discountApplied) / 100) : consultationFee}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                      This is an automated notification from your Healthcare Management System
                    </p>
                    <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0;">
                      © ${new Date().getFullYear()} Healthcare Platform. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Healthcare Platform <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🏥 New Appointment: ${patientName} with ${doctorName}`,
      html: emailHtml,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
