import { http } from './http'
import type { PaymentCaptureUploadResponse, PaymentCaptureValidateResponse } from '../types/api'

/** Manual (bank-transfer) payment-capture endpoints — see API_DOCUMENTATION (3).md § 8.
 *  Token-authorized; no Authorization header required.
 *  POST /api/payment-capture/upload is the confirmed-working multipart upload
 *  path — it saves the screenshot, runs the payment-verification-service OCR
 *  check documented in payment.md, and returns that verdict as `verification`
 *  alongside the resulting `payment_status`. */
export const paymentCaptureService = {
  /** POST /api/payment-capture/validate — order, items, payments, promo eligibility, bank details. */
  validate: (token: string) =>
    http
      .post<PaymentCaptureValidateResponse>('/api/payment-capture/validate', { token })
      .then((r) => r.data),

  /** POST /api/payment-capture/upload — multipart. A 200 does NOT mean approved —
   *  read `payment_status` on the response. */
  upload: (token: string, file: File) => {
    const form = new FormData()
    form.append('token', token)
    form.append('paymentScreenshot', file)
    return http
      .post<PaymentCaptureUploadResponse>('/api/payment-capture/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
