// EmailJS Configuration
export const emailConfig = {
  serviceId: "service_s92bktg",
  templateId: "template_muszna5",
  paymentConfirmationTemplateId: "template_qjgp0qd",
  publicKey: "cjDtInZXGrHoJMsBA", // Main account public key
  
  // Cancellation email service (NEW ACCOUNT)
  cancellationServiceId: "service_of6bpcr",
  bookingCancellationGuestTemplateId: "template_przs9mo",
  bookingCancellationHostTemplateId: "template_ra6w4ni",
  cancellationPublicKey: "c_0p3uSrynWtdnLSP", // Add the public key from new account
  
  // Reset Password Service (same as cancellation for now)
  resetPasswordServiceId: "service_of6bpcr",
  resetPasswordTemplateId: "template_przs9mo",
};

// Send reset password email using the dedicated service
export const sendResetPasswordEmail = async (userEmail, resetLink) => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    // Match the same format as email verification
    const templateParams = {
      email: userEmail, // Same as verification
      username: userEmail.split('@')[0], // Username from email
      link: resetLink, // Reset password link
    };

    console.log('📧 Sending reset email with params:', {
      serviceId: emailConfig.resetPasswordServiceId,
      templateId: emailConfig.resetPasswordTemplateId,
      publicKey: emailConfig.publicKey,
      templateParams
    });

    const response = await emailjs.send(
      emailConfig.resetPasswordServiceId,
      emailConfig.resetPasswordTemplateId,
      templateParams,
      emailConfig.cancellationPublicKey // Use the new account's public key
    );

    console.log('✅ Reset password email sent successfully:', response);
    console.log('📬 Reset email delivered to:', userEmail);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send reset password email:', error);
    console.error('Error details:', {
      message: error.message,
      text: error.text,
      status: error.status
    });
    return { success: false, error: error.message };
  }
};

// Send booking cancellation email
export const sendBookingCancellationEmail = async (guestEmail, guestName, bookingTitle) => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    const templateParams = {
      email: guestEmail,
      username: guestName,
      booking_title: bookingTitle,
    };

    console.log('📧 Sending cancellation email with params:', {
      serviceId: emailConfig.cancellationServiceId,
      templateId: emailConfig.bookingCancellationGuestTemplateId,
      publicKey: emailConfig.cancellationPublicKey, // Fixed: show correct public key
      templateParams
    });
    
    console.log('📬 Sending to email address:', guestEmail);
    console.log('👤 Guest name:', guestName);
    console.log('🏠 Booking title:', bookingTitle);

    console.log('🔍 Verifying service configuration...');
    console.log('Service ID exists:', !!emailConfig.cancellationServiceId);
    console.log('Template ID exists:', !!emailConfig.bookingCancellationGuestTemplateId);
    console.log('Public Key exists:', !!emailConfig.cancellationPublicKey); // Fixed: check correct public key

    const response = await emailjs.send(
      emailConfig.cancellationServiceId,
      emailConfig.bookingCancellationGuestTemplateId,
      templateParams,
      emailConfig.cancellationPublicKey // Use the new account's public key
    );

    console.log('✅ Booking cancellation email sent successfully:', response);
    console.log('📬 Cancellation email delivered to:', guestEmail);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send booking cancellation email:', error);
    console.error('Error details:', {
      message: error.message,
      text: error.text,
      status: error.status,
      name: error.name
    });
    
    // Additional debugging
    if (error.status === 400) {
      console.error('⚠️ 400 Error - Possible causes:');
      console.error('1. Service ID not found or inactive');
      console.error('2. Template ID does not exist in this service');
      console.error('3. Service not properly configured');
      console.error('4. Check EmailJS dashboard: https://dashboard.emailjs.com/');
    }
    
    return { success: false, error: error.message || error.text };
  }
};

// Send booking rejection email to guest (when host rejects)
export const sendBookingRejectionEmail = async (guestEmail, guestName, bookingName, totalPayable) => {
  try {
    const emailjs = await import('@emailjs/browser');
    
    const templateParams = {
      email: guestEmail,
      username: guestName,
      booking_name: bookingName,
      total_payable: totalPayable,
    };

    console.log('📧 Sending booking rejection email with params:', {
      serviceId: emailConfig.cancellationServiceId,
      templateId: emailConfig.bookingCancellationHostTemplateId,
      publicKey: emailConfig.cancellationPublicKey,
      templateParams
    });

    const response = await emailjs.send(
      emailConfig.cancellationServiceId,
      emailConfig.bookingCancellationHostTemplateId,
      templateParams,
      emailConfig.cancellationPublicKey
    );

    console.log('✅ Booking rejection email sent successfully:', response);
    console.log('📬 Rejection email delivered to:', guestEmail);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to send booking rejection email:', error);
    console.error('Error details:', {
      message: error.message,
      text: error.text,
      status: error.status,
      name: error.name
    });
    
    return { success: false, error: error.message || error.text };
  }
};

