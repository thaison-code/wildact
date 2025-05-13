document.addEventListener("DOMContentLoaded", async (event) => {

    // 1️⃣ Kiểm tra thiết bị có hỗ trợ Apple Pay không
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
        // console.error('This device does not support Apple Pay');
    } else {
        const applepay = paypal.Applepay();
        const applepayConfig = await applepay.config();

        if (applepayConfig.isEligible)
        {
            document.getElementById("applepay-container").innerHTML = '<apple-pay-button id="btn-appl" buttonstyle="white" type="donate" locale="en">';
            document.getElementById("btn-appl").addEventListener("click", () => startApplePaySession(applepay, applepayConfig));
        }
    }
})

async function startApplePaySession(applepay, applepayConfig)
{
    const formData = getFormData();
    if (!formData) return;

    // const applepay = paypal.Applepay();
    // const applepayConfig = await applepay.config();

    const paymentRequest = {
        countryCode: applepayConfig.countryCode,
        merchantCapabilities: applepayConfig.merchantCapabilities,
        supportedNetworks: applepayConfig.supportedNetworks,
        currencyCode: "USD",
        requiredShippingContactFields: ["name", "phone", "email", "postalAddress"],
        requiredBillingContactFields: ["postalAddress"],
        total: {
          label: "Donation",
          type: "final",
          amount: formData.amount,
        }
    };
    const session = new ApplePaySession(4, paymentRequest);

    // 3️⃣ Xác thực Merchant với PayPal
    session.onvalidatemerchant = (event) => {
        applepay.validateMerchant({
            validationUrl: event.validationURL,
            displayName: "Wildact Donate"
        })
        .then(validateResult => {
            session.completeMerchantValidation(validateResult.merchantSession);
        })
        .catch(validateError => {
            console.error(validateError);
            session.abort();
        });
    };

    // 4️⃣ Xử lý thanh toán khi được ủy quyền
    session.onpaymentauthorized = async (event) => {

        try {
            const orderId = await createPayPalOrder(formData);

            const confirmResult = await applepay.confirmOrder({
                orderId: orderId,
                token: event.payment.token,
                billingContact: event.payment.billingContact
            });

            if (confirmResult.status === "APPROVED")
            {
                session.completePayment(ApplePaySession.STATUS_SUCCESS);
                await capturePayPalOrder(orderId);

                alertSuccess();
            }else {
                alertError();
                throw new Error("Apple Pay order confirmation failed.");
            }

        } catch (error) {
            alertError();
            // console.error("Payment failed:", error);
            session.completePayment(ApplePaySession.STATUS_FAILURE);
        }
    };

    session.begin();
}
