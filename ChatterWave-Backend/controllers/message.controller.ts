import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { connect } from "http2";
import { getReceiverSocketId, io } from "../socket/socket";
import { encryptMessage } from "../helpers/algorithms/rsa.helper";

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const { message, publicKey, n } = req.body;

    const senderId = req.body.validatedUser.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: receiverId } } },
        ],
      },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: { connect: [{ id: senderId }, { id: receiverId }] },
        },
      });
    }
    const receiver = await prisma.user.findFirst({
      where: {
        id: receiverId,
      },
    });

    console.log(req.body?.validatedUser);
    const senderPublicKey: [bigint, bigint] = JSON.parse(
      req.body?.validatedUser?.publicKey
    );
    const receiverPublicKey: [bigint, bigint] = JSON.parse(
      receiver?.publicKey as string
    );
    const encryptedMessageFromSender = encryptMessage(message, senderPublicKey);
    const encryptedMessageForReceiver = encryptMessage(
      message,
      receiverPublicKey
    );
    console.log(encryptedMessageFromSender);
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        message,
        plainMessage: message,
        encryptedMessageForReceiver: encryptedMessageForReceiver,
        encryptedMessageFromSender: encryptedMessageFromSender,
        conversationId: conversation.id,
      },
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(201).json({
      success: true,
      data: {
        newMessage,
        conversation,
        receiverId,
      },
      message: "Message sent",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send Message", error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    //userTOChatId vaneko ko sanga kura garna lagya tesko id
    const { id: userToChatId } = req.params;
    const senderId = req.body.validatedUser.id;
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: userToChatId } } },
        ],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            conversationId: true,
            message: true,
            encryptedMessageForReceiver: true,
            encryptedMessageFromSender: true,
            senderId: true,
            receiverId: true,
            createdAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { conversation },
      message: "Conversation Fetched Success",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch Message", error });
  }
};
