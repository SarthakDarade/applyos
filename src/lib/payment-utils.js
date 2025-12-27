import { toast } from './toast';

export const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const handleSubscription = async (router, onError, onSuccess) => {
    // 1. Load Script
    const res = await loadRazorpay();
    if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
    }

    // 2. Create Subscription
    try {
        const response = await fetch('/api/payment/create-subscription', { method: 'POST' });

        if (response.status === 401) {
            toast.error("Please login to upgrade.");
            router.push('/login');
            return;
        }

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        const options = {
            key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            subscription_id: data.subscription_id,
            name: "ApplyOS Pro",
            description: "Unlimited Access Subscription",
            handler: async function (response) {
                // 3. Verify Payment
                try {
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        toast.success("Upgrade Successful! Welcome to Pro.");
                        if (onSuccess) onSuccess();
                        router.refresh();
                        router.push('/settings');
                    } else {
                        toast.error("Verification failed. Please contact support.");
                        if (onError) onError("Verification failed");
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Payment verification error.");
                    if (onError) onError(err.message);
                }
            },
            theme: {
                color: "#3B82F6"
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            toast.error(response.error.description || "Payment failed");
            if (onError) onError(response.error.description);
        });
        rzp1.open();

    } catch (error) {
        console.error(error);
        toast.error(error.message || 'Something went wrong initiating payment.');
        if (onError) onError(error.message);
    }
};
