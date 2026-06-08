import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import PaymeTransaction from "@/models/PaymeTransaction";
import { verifyPaymeAuth, PaymeErrors, UZS_TO_TIINS } from "@/lib/payme";

function rpcError(id: number | null, code: number, message: string, data?: string) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message: { ru: message, uz: message, en: message },
      ...(data ? { data } : {}),
    },
  });
}

function rpcResult(id: number | null, result: object) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!verifyPaymeAuth(authHeader)) {
    return rpcError(null, PaymeErrors.AUTH_FAILED, "Authentication failed");
  }

  let body: { id: number; method: string; params: any };
  try {
    body = await req.json();
  } catch {
    return rpcError(null, PaymeErrors.PARSE_ERROR, "Parse error");
  }

  const { id, method, params } = body;

  await dbConnect();

  switch (method) {
    case "CheckPerformTransaction":
      return handleCheckPerform(id, params);
    case "CreateTransaction":
      return handleCreateTransaction(id, params);
    case "PerformTransaction":
      return handlePerformTransaction(id, params);
    case "CancelTransaction":
      return handleCancelTransaction(id, params);
    case "CheckTransaction":
      return handleCheckTransaction(id, params);
    case "GetStatement":
      return handleGetStatement(id, params);
    default:
      return rpcError(id, PaymeErrors.METHOD_NOT_FOUND, "Method not found");
  }
}

async function handleCheckPerform(id: number, params: any) {
  const orderNumber = params?.account?.order_id;
  const amount: number = params?.amount;

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    return rpcError(id, PaymeErrors.ORDER_NOT_FOUND, "Order not found", "order");
  }

  // PayMe sends amount in tiins; orders store UZS. Compare in the same unit.
  if (amount !== (order as any).totalAmount * UZS_TO_TIINS) {
    return rpcError(id, PaymeErrors.INVALID_AMOUNT, "Incorrect amount", "amount");
  }

  if ((order as any).paymentStatus === "paid") {
    return rpcError(id, PaymeErrors.ALREADY_PAID, "Order already paid", "order");
  }

  if ((order as any).status === "cancelled") {
    return rpcError(id, PaymeErrors.ORDER_NOT_PAYABLE, "Order is cancelled", "order");
  }

  return rpcResult(id, { allow: true });
}

async function handleCreateTransaction(id: number, params: any) {
  const paymeId: string = params?.id;
  const orderNumber: string = params?.account?.order_id;
  const amount: number = params?.amount;
  const createTime: number = params?.time;

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    return rpcError(id, PaymeErrors.ORDER_NOT_FOUND, "Order not found", "order");
  }

  // PayMe sends amount in tiins; orders store UZS. Compare in the same unit.
  if (amount !== (order as any).totalAmount * UZS_TO_TIINS) {
    return rpcError(id, PaymeErrors.INVALID_AMOUNT, "Incorrect amount", "amount");
  }

  if ((order as any).status === "cancelled") {
    return rpcError(id, PaymeErrors.ORDER_NOT_PAYABLE, "Order is cancelled", "order");
  }

  // Check if this PayMe transaction already exists
  const existing = await PaymeTransaction.findOne({ paymeId });
  if (existing) {
    if (existing.state === -1 || existing.state === -2) {
      return rpcError(id, PaymeErrors.TRANSACTION_CANCELLED, "Transaction cancelled");
    }
    return rpcResult(id, {
      create_time: existing.createTime,
      transaction: existing._id.toString(),
      state: existing.state,
    });
  }

  // Check if another PayMe transaction exists for this order (and is still active)
  const orderTx = await PaymeTransaction.findOne({ orderNumber, state: { $in: [1, 2] } });
  if (orderTx) {
    return rpcError(id, PaymeErrors.ALREADY_PAID, "Another transaction exists for this order", "order");
  }

  const tx = await PaymeTransaction.create({
    paymeId,
    orderNumber,
    amount,
    state: 1,
    createTime,
    performTime: 0,
    cancelTime: 0,
  });

  return rpcResult(id, {
    create_time: tx.createTime,
    transaction: tx._id.toString(),
    state: tx.state,
  });
}

async function handlePerformTransaction(id: number, params: any) {
  const paymeId: string = params?.id;

  const tx = await PaymeTransaction.findOne({ paymeId });
  if (!tx) {
    return rpcError(id, PaymeErrors.TRANSACTION_NOT_FOUND, "Transaction not found");
  }

  if (tx.state === 2) {
    // Already completed — idempotent response
    return rpcResult(id, {
      transaction: tx._id.toString(),
      perform_time: tx.performTime,
      state: tx.state,
    });
  }

  if (tx.state !== 1) {
    return rpcError(id, PaymeErrors.TRANSACTION_CANCELLED, "Transaction cancelled");
  }

  const performTime = Date.now();

  await PaymeTransaction.findByIdAndUpdate(tx._id, { state: 2, performTime });

  // Mark order as paid
  const order = await Order.findOneAndUpdate(
    { orderNumber: tx.orderNumber },
    { paymentStatus: "paid", paymentMethod: "payme" },
    { new: true }
  );

  // Notify admins via Telegram
  if (order) {
    try {
      const { sendOrderNotification } = await import("@/lib/telegram");
      await sendOrderNotification(order);
    } catch (err) {
      console.error("PayMe: failed to send Telegram notification", err);
    }
  }

  return rpcResult(id, {
    transaction: tx._id.toString(),
    perform_time: performTime,
    state: 2,
  });
}

async function handleCancelTransaction(id: number, params: any) {
  const paymeId: string = params?.id;
  const reason: number = params?.reason;

  const tx = await PaymeTransaction.findOne({ paymeId });
  if (!tx) {
    return rpcError(id, PaymeErrors.TRANSACTION_NOT_FOUND, "Transaction not found");
  }

  if (tx.state === -1 || tx.state === -2) {
    // Already cancelled — idempotent
    return rpcResult(id, {
      transaction: tx._id.toString(),
      cancel_time: tx.cancelTime,
      state: tx.state,
    });
  }

  const cancelTime = Date.now();
  const newState = tx.state === 1 ? -1 : -2;

  await PaymeTransaction.findByIdAndUpdate(tx._id, { state: newState, cancelTime, reason });

  await Order.findOneAndUpdate(
    { orderNumber: tx.orderNumber },
    { paymentStatus: "failed" }
  );

  return rpcResult(id, {
    transaction: tx._id.toString(),
    cancel_time: cancelTime,
    state: newState,
  });
}

async function handleCheckTransaction(id: number, params: any) {
  const paymeId: string = params?.id;

  const tx = await PaymeTransaction.findOne({ paymeId });
  if (!tx) {
    return rpcError(id, PaymeErrors.TRANSACTION_NOT_FOUND, "Transaction not found");
  }

  return rpcResult(id, {
    create_time: tx.createTime,
    perform_time: tx.performTime,
    cancel_time: tx.cancelTime,
    transaction: tx._id.toString(),
    state: tx.state,
    reason: tx.reason ?? null,
  });
}

async function handleGetStatement(id: number, params: any) {
  const from: number = params?.from;
  const to: number = params?.to;

  const transactions = await PaymeTransaction.find({
    createTime: { $gte: from, $lte: to },
  }).lean();

  return rpcResult(id, {
    transactions: transactions.map((tx) => ({
      id: tx.paymeId,
      time: tx.createTime,
      amount: tx.amount,
      account: { order_id: tx.orderNumber },
      create_time: tx.createTime,
      perform_time: tx.performTime,
      cancel_time: tx.cancelTime,
      transaction: tx._id.toString(),
      state: tx.state,
      reason: tx.reason ?? null,
    })),
  });
}
