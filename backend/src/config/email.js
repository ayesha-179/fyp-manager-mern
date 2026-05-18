// Simple placeholder if email not configured yet
const sendVerificationEmail = async (email, name, code) => {
  console.log(`📧 Would send email to ${email} with code: ${code}`);
  return { success: true };
};

module.exports = { sendVerificationEmail };