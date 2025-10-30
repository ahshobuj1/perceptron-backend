import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentServices } from './payment.service';

const initiatePayment = catchAsync(async (req, res) => {
  const result = await paymentServices.initiatePayment(req.user, req.body);
  sendResponse(res, {
    message: 'Payment initiated. Redirecting to payment gateway...',
    result: result, // { GatewayPageURL: '...' }
  });
});

const handleSuccessWebhook = catchAsync(async (req, res) => {
  await paymentServices.handleSuccessWebhook(req.body);
  sendResponse(res, {
    message: 'Payment successful, order is processing.',
    result: null,
  });
});

const handleFailWebhook = catchAsync(async (req, res) => {
  await paymentServices.handleFailWebhook(req.body);
  sendResponse(res, {
    message: 'Payment failed.',
    result: null,
  });
});

const handleCancelWebhook = catchAsync(async (req, res) => {
  await paymentServices.handleCancelWebhook(req.body);
  sendResponse(res, {
    message: 'Payment cancelled.',
    result: null,
  });
});

export const paymentController = {
  initiatePayment,
  handleSuccessWebhook,
  handleFailWebhook,
  handleCancelWebhook,
};
