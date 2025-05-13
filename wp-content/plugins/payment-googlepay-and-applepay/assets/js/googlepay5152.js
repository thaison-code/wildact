/*
* Define the version of the Google Pay API referenced when creating your
* configuration
*/
const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
};

let paymentsClient = null,
    allowedPaymentMethods = null,
    merchantInfo = null;

  /* Configure your site's support for payment methods supported by the Google Pay */
function getGoogleIsReadyToPayRequest(allowedPaymentMethods) {
    return Object.assign({}, baseRequest, {
      allowedPaymentMethods: allowedPaymentMethods,
    });
}
/* Fetch Default Config from PayPal via PayPal SDK */
async function getGooglePayConfig() {
    if (allowedPaymentMethods == null || merchantInfo == null) {
      const googlePayConfig = await paypal.Googlepay().config();
      allowedPaymentMethods = googlePayConfig.allowedPaymentMethods;
      merchantInfo = googlePayConfig.merchantInfo;
    }
    return {
      allowedPaymentMethods,
      merchantInfo,
    };
}
/* Configure support for the Google Pay API */
async function getGooglePaymentDataRequest(formData)
{
    const paymentDataRequest = Object.assign({}, baseRequest);
    const { allowedPaymentMethods, merchantInfo } = await getGooglePayConfig();
    paymentDataRequest.allowedPaymentMethods = allowedPaymentMethods;
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo(formData);
    paymentDataRequest.merchantInfo = merchantInfo;
    paymentDataRequest.callbackIntents = ["PAYMENT_AUTHORIZATION"];
    return paymentDataRequest;
}

function onPaymentAuthorized(paymentData) {
    return new Promise(function (resolve, reject) {
      processPayment(paymentData)
        .then(function (data) {
            alertSuccess();
            resolve({ transactionState: "SUCCESS" });
        })
        .catch(function (errDetails) {
            alertError();
            resolve({ transactionState: "ERROR" });
        });
    });
}
function getGooglePaymentsClient() {
    if (paymentsClient === null) {
      paymentsClient = new google.payments.api.PaymentsClient({
        environment: paypal_env, // or "PRODUCTION, paypal_env"
        paymentDataCallbacks: {
          onPaymentAuthorized: onPaymentAuthorized,
        },
      });
    //   console.log(paypal_env);
    }
    return paymentsClient;
}
async function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    const { allowedPaymentMethods } = await getGooglePayConfig();
    paymentsClient
      .isReadyToPay(getGoogleIsReadyToPayRequest(allowedPaymentMethods))
      .then(function (response) {
        if (response.result) {
            addGooglePayButton();
        }
    })
    .catch(function (err) {
        console.error(err);
    });
}
function addGooglePayButton() {
    const paymentsClient = getGooglePaymentsClient();
    const button = paymentsClient.createButton({
        buttonColor: 'black',
        buttonType: 'donate',
        buttonRadius: 4,
      onClick: onGooglePaymentButtonClicked,

    });
    const buttonContainer = document.getElementById("button-container");
    if(buttonContainer)
    {
        buttonContainer.appendChild(button);    
    }
}
function getGoogleTransactionInfo(formData) {
    // console.log(formData);
    return {
        displayItems: [
            {
                label: "Donate",
                type: "SUBTOTAL",
                price: formData.amount,
            },
            // {
            //     label: "Tax",
            //     type: "TAX",
            //     price: "1.00",
            // },
        ],
        countryCode: "US",
        currencyCode: "USD",
        totalPriceStatus: "FINAL",
        totalPrice: formData.amount,
        totalPriceLabel: "Total",
    };
}
async function onGooglePaymentButtonClicked() {

    const formData = getFormData();
    if (!formData) return;

    const paymentDataRequest = await getGooglePaymentDataRequest(formData);
    // paymentDataRequest.transactionInfo = getGoogleTransactionInfo(formData);
    // console.log(paymentDataRequest);
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest);
}
async function processPayment(paymentData) {
    
    try {
        const formData = getFormData();

        /* Create Order */
        const orderId = await createPayPalOrder(formData);

        const { status } = await paypal.Googlepay().confirmOrder({
            orderId: orderId,
            paymentMethodData: paymentData.paymentMethodData,
        });

        if (status === "APPROVED")
        {
            await capturePayPalOrder(orderId);

            return { transactionState: "SUCCESS" };
        }else {
            return { transactionState: "ERROR" };
        }
    } catch (err) {
        return {
            transactionState: "ERROR",
            error: {
                message: err.message,
            },
        };
    }
}


document.addEventListener("DOMContentLoaded", (event) => {
    if (google && paypal.Googlepay) {
        onGooglePayLoaded().catch(console.log);
    }
});