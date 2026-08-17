// The sentence a visitor ticks on the callback widget.
//
// It lives here rather than in either the form or the API route because both
// need the identical string: the form shows it, and the route stores it on the
// lead alongside the timestamp. If a carrier ever asks what someone agreed to,
// the answer has to be the wording that was actually on screen — so there is
// one copy of it, and the submitted text is checked against this.
export const CALLBACK_CONSENT_TEXT =
  "I agree that ArkiTech Solutions can contact me at this number by phone and text message about my enquiry. Message frequency varies, message and data rates may apply, and I can reply STOP at any time.";
