const endpoint = 'https://api-m.paypal.com'; // https://api-m.sandbox.paypal.com
const paypal_env = 'PRODUCTION'; // "TEST" or "PRODUCTION"

// 5️⃣ Lấy dữ liệu từ form
function getFormData() {
    let subscriptionPeriod = null;
    const donationType = document.getElementById("donationType").value;
    let amount = null;
    const customAmountDonate = document.getElementById("customAmountDonate").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("emailDonate").value.trim();

    const subscriptionRadios = document.querySelectorAll('input[name="subscriptionPeriod"]');
    subscriptionRadios.forEach(radio => {
        if (radio.checked) {
            subscriptionPeriod = radio.value;
        }
    });

    if (customAmountDonate !== "" && !isNaN(customAmountDonate) && parseFloat(customAmountDonate) > 0) {
        amount = customAmountDonate;
    }else {
        // Lấy giá trị amount từ radio button
        const amountRadios = document.querySelectorAll('input[name="amountDonate"]');
        amountRadios.forEach(radio => {
            if (radio.checked) {
                amount = radio.value;
            }
        })
    }

    if (!amount || isNaN(amount) || amount <= 0 || !firstName || !lastName || !email) {
        alert("Please fill all fields with valid data.");
        return null;
    }

    return { subscriptionPeriod, donationType, amount, firstName, lastName, email };
}


// 6️⃣ Tạo đơn hàng trên PayPal
async function createPayPalOrder(formData) {
    const accessToken = await getPayPalAccessToken();

    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: formData.amount,
                },
                // payee: {
                //     email_address: formData.email,
                // },
            },
        ],
        payer: {
            name: {
                given_name: formData.firstName,
                surname: formData.lastName,
            },
            email_address: formData.email,
        },
    };

    const response = await fetch(`${endpoint}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    });

    const data = await response.json();
    return data.id;
}

// 7️⃣ Thu tiền từ đơn hàng
async function capturePayPalOrder(orderId) {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${endpoint}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    const captureData = await response.json();
    
    if (captureData.status !== "COMPLETED") {
        throw new Error("Payment capture failed.");
    }
    
    return captureData;
}

// get access token
async function getPayPalAccessToken() {
    const clientId = "AYUs5NtIXRWXGx2ITHvOVqPCsWZQ7-xXRaZVWk3iUgQNPTxckrrcyVbulXbpRSlu8bFboBDUTdWiUVfY";  // 🔹 Điền Client ID của PayPal
    const secret = "ELK9vRgaQg4CQQ_72yZPln_-X5zozVBtwprukjZ288rFeHDCiPuA9oT4-f5AN39p156hYcbc9Eo5dkv1";       // 🔹 Điền Secret của PayPal

    const auth = btoa(`${clientId}:${secret}`);

    const response = await fetch(`${endpoint}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();

    return data.access_token;
}

function alertSuccess(title = 'Success!', html = '')
{
    Swal.fire({
        title: title,
        html: html,
        icon: "success",
        draggable: true
    });
}

function alertError(title = 'Error!', html = '')
{
    Swal.fire({
        title: title,
        html: html,
        icon: "error",
        draggable: true
    });
}