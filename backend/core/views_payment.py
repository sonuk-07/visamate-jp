import os
import json
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or getattr(settings, "STRIPE_SECRET_KEY", None)

APPLICATION_FEE_AMOUNT = 2500   # $25.00 USD
APPLICATION_FEE_CURRENCY = "usd"


def get_user_from_jwt(request):
    """Extract and validate the JWT token from the Authorization header."""
    jwt_auth = JWTAuthentication()
    try:
        result = jwt_auth.authenticate(request)
        if result is None:
            return None
        user, _ = result
        return user
    except (InvalidToken, TokenError):
        return None


@csrf_exempt
@require_POST
def create_payment_intent(request):
    user = get_user_from_jwt(request)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    applicant_id = data.get("applicant_id")
    if not applicant_id:
        return JsonResponse({"error": "applicant_id is required."}, status=400)

    try:
        from applicants.models import Applicant
        applicant = Applicant.objects.get(id=applicant_id, user=user)
    except Exception:
        return JsonResponse({"error": "Applicant not found."}, status=404)

    # Reuse existing pending PaymentIntent
    existing_intent_id = getattr(applicant, "stripe_payment_intent_id", None)
    if existing_intent_id:
        try:
            intent = stripe.PaymentIntent.retrieve(existing_intent_id)
            if intent.status not in ("succeeded", "canceled"):
                return JsonResponse({"clientSecret": intent.client_secret})
        except stripe.error.StripeError:
            pass

    try:
        intent = stripe.PaymentIntent.create(
            amount=APPLICATION_FEE_AMOUNT,
            currency=APPLICATION_FEE_CURRENCY,
            idempotency_key=f"applicant-{applicant_id}-fee",
            metadata={
                "applicant_id": str(applicant_id),
                "user_id": str(user.id),
                "user_email": user.email,
            },
            description=f"Application processing fee — Applicant #{applicant_id}",
            receipt_email=user.email,
        )

        if hasattr(applicant, "stripe_payment_intent_id"):
            applicant.stripe_payment_intent_id = intent.id
            applicant.save(update_fields=["stripe_payment_intent_id"])

        return JsonResponse({"clientSecret": intent.client_secret})

    except stripe.error.CardError as e:
        return JsonResponse({"error": e.user_message}, status=402)
    except stripe.error.InvalidRequestError as e:
        print(f"[Stripe InvalidRequestError] {e}")
        return JsonResponse({"error": str(e)}, status=400)
    except stripe.error.StripeError as e:
        print(f"[StripeError] {e}")
        return JsonResponse({"error": "Payment service error. Please try again."}, status=502)
    except Exception as e:
        print(f"[PaymentIntent unexpected error] {e}")
        return JsonResponse({"error": "An unexpected error occurred."}, status=500)


@csrf_exempt
@require_POST
def confirm_payment(request):
    """
    Called by the frontend immediately after Stripe confirms payment.
    Verifies the PaymentIntent status directly with Stripe before
    updating payment_status — so it cannot be spoofed.
    """
    user = get_user_from_jwt(request)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    payment_intent_id = data.get("payment_intent_id")
    applicant_id = data.get("applicant_id")

    if not payment_intent_id or not applicant_id:
        return JsonResponse({"error": "payment_intent_id and applicant_id are required."}, status=400)

    # Verify with Stripe directly — never trust the client alone
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        return JsonResponse({"error": str(e)}, status=400)

    if intent.status != "succeeded":
        return JsonResponse({"error": f"Payment not completed. Status: {intent.status}"}, status=402)

    # Double-check the intent belongs to this applicant
    if intent.metadata.get("applicant_id") != str(applicant_id):
        return JsonResponse({"error": "Payment intent does not match applicant."}, status=403)

    try:
        from applicants.models import Applicant
        updated = Applicant.objects.filter(
            id=applicant_id, user=user
        ).update(
            payment_status="paid",
            stripe_payment_intent_id=payment_intent_id,
        )
        if updated == 0:
            return JsonResponse({"error": "Applicant not found."}, status=404)
    except Exception as e:
        print(f"[confirm_payment DB error] {e}")
        return JsonResponse({"error": "Failed to update payment status."}, status=500)

    return JsonResponse({"status": "paid"})


@csrf_exempt
@require_POST
def stripe_webhook(request):
    """
    Stripe webhook — backup for when confirm_payment isn't called
    (e.g. user closes browser after payment but before redirect).
    Register at: https://dashboard.stripe.com/test/webhooks
    """
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET") or getattr(
        settings, "STRIPE_WEBHOOK_SECRET", None
    )
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        return JsonResponse({"error": "Invalid signature."}, status=400)

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        applicant_id = intent["metadata"].get("applicant_id")
        if applicant_id:
            try:
                from applicants.models import Applicant
                Applicant.objects.filter(id=applicant_id).update(
                    payment_status="paid",
                    stripe_payment_intent_id=intent["id"],
                )
            except Exception as e:
                print(f"[Webhook] Failed to update applicant {applicant_id}: {e}")

    return JsonResponse({"status": "ok"})