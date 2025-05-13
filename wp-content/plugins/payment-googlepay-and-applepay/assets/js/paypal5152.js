window.paypal
    .Buttons({
        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "donate",
        } ,

        async createOrder() {
            try {
                const formData = getFormData();
                
                if(!formData) throw new Error('Please fill info!');
                
                const orderId = await createPayPalOrder(formData);

                if (orderId) {
                    return orderId;
                }

                throw new Error('Please try late!');
                
            } catch (error) {
                
                alertError(error.message);
            }
        } ,

        async onApprove(data, actions) {
            try {
                
                const orderData = await capturePayPalOrder(data.orderID);

                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED")
                {
                    alertError('Please check!', 'Credit card declined<br>PayPal Balance Insufficient<br>User needs to re-verify payment method');
                    return actions.restart();
                    
                } else if (errorDetail) {
                    
                    throw new Error(
                        `${errorDetail.description} (${orderData.debug_id})`
                    );
                } else if (!orderData.purchase_units) {
                    
                    throw new Error(JSON.stringify(orderData));
                } else {
                    
                    // const transaction =
                    //     orderData?.purchase_units?.[0]?.payments
                    //         ?.captures?.[0] ||
                    //     orderData?.purchase_units?.[0]?.payments
                    //         ?.authorizations?.[0];
                    
                    alertSuccess();
                    
                    // alertSuccess('Success!', `Transaction ${transaction.status}: ${transaction.id}<br>
                    //     <br>See console for all available details`);
                }
            } catch (error) {
                
                alertError('Error!', `Sorry, your transaction could not be processed...<br><br>${error}`);
            }
        } ,
    })
    .render("#paypal-button-container"); 