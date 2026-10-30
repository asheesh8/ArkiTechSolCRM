/**
 * The one SMS program ArkiTech runs: Command Center internal notifications to
 * team members who opt in. These strings are what a carrier reviewer compares
 * against the A2P 10DLC campaign registration, so they have to match it and
 * each other word for word.
 *
 * - CONSENT and ENROLLMENT are copies of CONSENT_TEXT and ENROLL_TEXT in the
 *   Command Center's supabase/functions/my-settings/index.ts. Change them there
 *   and here together.
 * - The keyword replies are what Twilio sends for STOP, HELP and START. They
 *   are set in Twilio (Messaging Service → Opt-Out Management), not in code, so
 *   keep Twilio's text identical to these.
 */

export const SMS_SENDER = "ArkiTech Solutions LLC, operating as ArkiTech Solutions";

export const SMS_PROGRAM = "Command Center internal notifications";

export const SMS_CONSENT =
  "I agree to receive SMS notifications from ArkiTech Solutions LLC, operating as ArkiTech Solutions, through Command Center. Messages include internal new-lead notifications, company announcements, and system alerts. New-lead notification frequency varies as leads arrive; company announcements and system alerts total no more than 3 messages per week. Msg & data rates may apply. Reply HELP for help or STOP to opt out. SMS enrollment is optional and is not required to use Command Center.";

export const SMS_ENROLLMENT =
  "ArkiTech Solutions: You’re enrolled in Command Center internal notifications. New-lead message frequency varies; company announcements and system alerts total up to 3 msgs/week. Message and data rates may apply. Reply HELP for help or STOP to opt out.";

export const SMS_KEYWORD_REPLIES = [
  {
    keywords: "STOP (also STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT)",
    reply:
      "ArkiTech Solutions: You’re unsubscribed from Command Center notifications and will receive no further messages. Reply START to resubscribe.",
  },
  {
    keywords: "HELP (also INFO)",
    reply:
      "ArkiTech Solutions Command Center notifications. New-lead alerts vary; announcements and system alerts up to 3 msgs/week. Msg & data rates may apply. Help: studio@sol-arkitech.com or (802) 557-8828. Reply STOP to opt out.",
  },
  {
    keywords: "START (also UNSTOP, YES)",
    reply:
      "ArkiTech Solutions: You’re resubscribed to Command Center notifications. New-lead alerts vary; announcements and system alerts up to 3 msgs/week. Msg & data rates may apply. Reply HELP for help or STOP to opt out.",
  },
] as const;
