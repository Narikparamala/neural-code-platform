const ENDPOINT = 'https://formsubmit.co/ajax/narikparamala@gmail.com';

export type SubmissionResult = {
  success: boolean;
  message: string;
};

/**
 * Sends a form submission to the project inbox through FormSubmit (free, no backend).
 * The first ever submission triggers a one-time activation email to the inbox owner.
 */
export async function submitToInbox(
  data: Record<string, string>
): Promise<SubmissionResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _captcha: 'false',
        _template: 'table',
        ...data,
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      success?: string | boolean;
      message?: string;
    };

    const ok = res.ok && (json.success === true || json.success === 'true');

    return {
      success: ok,
      message:
        json.message ||
        (ok ? 'Sent. Thank you!' : 'Could not send right now. Please try again.'),
    };
  } catch {
    return {
      success: false,
      message: 'Network error. Check your connection and try again.',
    };
  }
}
