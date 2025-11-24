import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getReceiverSocketIds, io } from "../socket/socket";
import { encryptMessage } from "../helpers/algorithms/rsa.helper";

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
  // Create or reuse a conversation, encrypt the payload for both parties, then inform the receiver over sockets.
  try {
    const { id: receiverId } = req.params;
    const { message } = req.body;

    // Validate required fields
    if (!message || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Message and receiver ID are required"
      });
    }

    const senderId = req.body.validatedUser.id;

    // Check if sender and receiver exist
    const sender = await prisma.user.findFirst({
      where: { id: senderId }
    });

    const receiver = await prisma.user.findFirst({
      where: { id: receiverId }
    });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "Sender or receiver not found"
      });
    }

    // Find the conversation shared between both users (create if missing).
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: receiverId } } },
        ],
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      // Lazily create the conversation record the first time these two people chat.
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: receiverId }],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Parse RSA keys with error handling
    let encryptedMessageFromSender = message;
    let encryptedMessageForReceiver = message;

    try {
      if (sender.publicKey && sender.privateKey) {
        const senderPublicKey = JSON.parse(sender.publicKey) as [bigint, bigint];
        encryptedMessageFromSender = encryptMessage(message, senderPublicKey);
      }

      if (receiver.publicKey) {
        const receiverPublicKey = JSON.parse(receiver.publicKey) as [bigint, bigint];
        encryptedMessageForReceiver = encryptMessage(message, receiverPublicKey);
      }
    } catch (keyError) {
      // Broken/missing keys should not block messaging; fall back to plaintext while we log the error.
      console.error("RSA encryption failed, falling back to plain message:", keyError);
      encryptedMessageFromSender = message;
      encryptedMessageForReceiver = message;
    }

    // Create message in database
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

    // Send socket notification
    const receiverSocketIds = getReceiverSocketIds(receiverId);
    if (receiverSocketIds.length > 0) {
      // Emit to every active device/browser owned by the receiver.
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", newMessage);
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        newMessage,
        conversation,
        receiverId,
      },
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      // Reveal stack traces only in dev environments so production responses stay clean.
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  // Fetch the shared conversation thread between two users, ordered chronologically.
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.body.validatedUser.id;

    // Find conversation using a simpler approach
    // const conversation = await prisma.conversation.findFirst({
    //   where: {
    //     participants: {
    //       some: {
    //         id: senderId
    //       }
    //     }
    //   },
    //   include: {
    //     participants: true,
    //     messages: {
    //       orderBy: {
    //         createdAt: "asc",
    //       },
    //       select: {
    //         id: true,
    //         conversationId: true,
    //         message: true,
    //         encryptedMessageForReceiver: true,
    //         encryptedMessageFromSender: true,
    //         senderId: true,
    //         receiverId: true,
    //         createdAt: true,
    //       },
    //     },
    //   },
    // });

    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: userToChatId } } },
        ],
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
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

    // Check if the other user is also in this conversation
    if (conversation && !conversation.participants.some(p => p.id === userToChatId)) {
      // Safety net: if the other person left the thread, treat it as missing.
      return res.status(200).json({
        success: true,
        data: { conversation: null },
        message: "No conversation found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { conversation },
      message: "Conversation fetched successfully",
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import { connect } from "http2";
// import { getReceiverSocketId, io } from "../socket/socket";
// import { encryptMessage } from "../helpers/algorithms/rsa.helper";

// const prisma = new PrismaClient();

// export const sendMessage = async (req: Request, res: Response) => {
//   try {
//     const { id: receiverId } = req.params;
//     const { message, publicKey, n } = req.body;

//     const senderId = req.body.validatedUser.id;

//     let conversation = await prisma.conversation.findFirst({
//       where: {
//         AND: [
//           { participants: { some: { id: senderId } } },
//           { participants: { some: { id: receiverId } } },
//         ],
//       },
//     });
//     if (!conversation) {
//       conversation = await prisma.conversation.create({
//         data: {
//           participants: { connect: [{ id: senderId }, { id: receiverId }] },
//         },
//       });
//     }
//     const receiver = await prisma.user.findFirst({
//       where: {
//         id: receiverId,
//       },
//     });

//     console.log(req.body?.validatedUser);
//     const senderPublicKey: [bigint, bigint] = JSON.parse(
//       req.body?.validatedUser?.publicKey
//     );
//     const receiverPublicKey: [bigint, bigint] = JSON.parse(
//       receiver?.publicKey as string
//     );
//     const encryptedMessageFromSender = encryptMessage(message, senderPublicKey);
//     const encryptedMessageForReceiver = encryptMessage(
//       message,
//       receiverPublicKey
//     );
//     console.log(encryptedMessageFromSender);
//     const newMessage = await prisma.message.create({
//       data: {
//         senderId,
//         receiverId,
//         message,
//         plainMessage: message,
//         encryptedMessageForReceiver: encryptedMessageForReceiver,
//         encryptedMessageFromSender: encryptedMessageFromSender,
//         conversationId: conversation.id,
//       },
//     });

//     const receiverSocketId = getReceiverSocketId(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("newMessage", newMessage);
//     }
//     return res.status(201).json({
//       success: true,
//       data: {
//         newMessage,
//         conversation,
//         receiverId,
//       },
//       message: "Message sent",
//     });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to send Message", error });
//   }
// };

// export const getMessages = async (req: Request, res: Response) => {
//   try {
//     //userTOChatId vaneko ko sanga kura garna lagya tesko id
//     const { id: userToChatId } = req.params;
//     const senderId = req.body.validatedUser.id;
//     const conversation = await prisma.conversation.findFirst({
//       where: {
//         AND: [
//           { participants: { some: { id: senderId } } },
//           { participants: { some: { id: userToChatId } } },
//         ],
//       },
//       include: {
//         messages: {
//           orderBy: {
//             createdAt: "asc",
//           },
//           select: {
//             conversationId: true,
//             message: true,
//             encryptedMessageForReceiver: true,
//             encryptedMessageFromSender: true,
//             senderId: true,
//             receiverId: true,
//             createdAt: true,
//           },
//         },
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       data: { conversation },
//       message: "Conversation Fetched Success",
//     });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch Message", error });
//   }
// };
