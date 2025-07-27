import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"


import Stripe from "stripe";
// import razorpay from 'razorpay';

const currency = "USD";
const delivery_chage = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,  // Replace with your Razorpay Key ID
//     key_secret: process.env.RAZORPAY_KEY_SECRET,  // Replace with your Razorpay Key Secret
// });


const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using stripe method

const placeOrderStripe = async (req, res, next) => {
    try {
        const { userId, address, amount, items } = req.body;

        const { origin } = req.headers;
        console.log(req.headers);
        const orderData = {
            items,
            address,
            amount,
            userId,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now(),
        };
        const newOrder = new orderModel(orderData)
        await newOrder.save()
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: delivery_chage * 100,
            },
            quantity: 1,
        });
        console.log(origin);
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};
const verifyStripe = async (req, res, next) => {
    try {
        const { orderId, success, userId } = req.body;

        if (success === "true") {
            await orderModel.findByIdAndUpdate(
                orderId,
                { payment: true },

            );
            await userModel.findByIdAndUpdate(
                userId,
                { cartData: {} },

            );
            res.json({ success: true, message: "successfully verified" })

        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};
// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {
    // try {
    //     const { userId, items, amount, address } = req.body
    //     const orderData = {
    //         userId,
    //         items,
    //         amount,
    //         address,
    //         paymentMethod: "Razorpay",
    //         payment: false,
    //         date: Date.now()
    //     }
    //     const newOrder = new orderModel(orderData)
    //     await newOrder.save()

    //     const options = {
    //         amount: amount * 100, // Convert amount to paise
    //         currency: currency.toUpperCase(),
    //         receipt: newOrder._id.toString(),
    //     };

    //     await razorpayInstance.orders.create(options, (error, order) => {
    //         if (error) {
    //             console.log(error);
    //             res.json({ success: false, message: error })
    //         }
    //         res.json({ success: true, order })

    //     });

    // }
    // catch (error) {
    //     console.log(error)
    //     res.json({ success: false, message: error.message })
    // }
}



const verifyRazorpay = async (req, res, next) => {
    // try {
    //     const { razorpay_order_id, userId } = req.body;
    //     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
    //     if (orderInfo.status === 'paid') {
    //         await orderModel.findByIdAndUpdate(
    //             orderInfo.receipt,
    //             { payment: true },
    //             { new: true }
    //         );
    //         await userModel.findByIdAndUpdate(
    //             userId,
    //             { cartData: {} },
    //             { new: true }
    //         );
    //         res.json({ success: true, message: "successfully verified" })

    //     } else {
    //         await orderModel.findByIdAndDelete(orderInfo.receipt);
    //         res.json({ success: false });
    //     }


    // } catch (error) {
    //     console.log(error)
    //     res.json({ success: false, message: error.message })
    // }
};

// All orders data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: "Order Status Updated" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { verifyRazorpay, verifyStripe, placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders }