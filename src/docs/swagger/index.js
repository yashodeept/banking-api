/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "clhq1z..."
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *         role:
 *           type: string
 *           example: "CUSTOMER"
 *         isVerified:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "StrongPassword123!"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "jane.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "StrongPassword123!"
 *
 *     StandardSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation successful"
 *         data:
 *           type: object
 *
 *     StandardErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred"
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "VALIDATION_FAILED"
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - method
 *         - receiverWalletId
 *       properties:
 *         amount:
 *           type: number
 *           example: 1000
 *         method:
 *           type: string
 *           enum: [UPI, BANK_TRANSFER, CARD, WALLET]
 *         receiverWalletId:
 *           type: string
 *           example: "clhq1z..."
 *         description:
 *           type: string
 *           example: "Payment for services"
 *
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         paymentRef:
 *           type: string
 *         transactionId:
 *           type: string
 *         amount:
 *           type: number
 *         method:
 *           type: string
 *         status:
 *           type: string
 *         idempotencyKey:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
