const Message = require('../models/Message');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Helper pour envoyer via Socket.io
const broadcastMessage = (req, message) => {
  const io = req.app.get('io');
  if (io) {
    const roomId = `conversation-${message.senderId}-${message.receiverId}`;
    io.to(roomId).emit('new-message', message);
  }
};

// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, appointmentId, content, attachments } = req.body;
    const senderId = req.user._id;

    // Vérifier que le destinataire existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    // Si appointmentId fourni, vérifier que l'utilisateur a accès à ce rendez-vous
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }

      // Vérifier que le sender est soit le client, soit le garagiste du garage
      const isClient = appointment.clientId.toString() === senderId.toString();
      const isGaragiste = req.user.role === 'garagiste' && appointment.garageId.toString() === req.user.garageId?.toString();

      if (!isClient && !isGaragiste && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé à envoyer un message pour ce rendez-vous' });
      }

      // Vérifier que le receiver est l'autre partie du rendez-vous
      if (isClient) {
        const Garage = require('../models/Garage');
        const garage = await Garage.findById(appointment.garageId);
        if (garage && receiverId.toString() !== garage.ownerId.toString()) {
          return res.status(403).json({ message: 'Destinataire invalide pour ce rendez-vous' });
        }
      } else if (isGaragiste) {
        if (receiverId.toString() !== appointment.clientId.toString()) {
          return res.status(403).json({ message: 'Destinataire invalide pour ce rendez-vous' });
        }
      }
    }

    const message = await Message.create({
      senderId,
      receiverId,
      appointmentId: appointmentId || null,
      content,
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email avatar role')
      .populate('receiverId', 'name email avatar role');

    // Remplacer le nom de l'admin par "Promoto"
    const messageObj = populatedMessage.toObject();
    if (messageObj.senderId && messageObj.senderId.role === 'admin') {
      messageObj.senderId.name = 'Promoto';
    }
    if (messageObj.receiverId && messageObj.receiverId.role === 'admin') {
      messageObj.receiverId.name = 'Promoto';
    }

    // Diffuser le message via Socket.io
    broadcastMessage(req, messageObj);

    // Créer la réponse avec le nom "Promoto" pour l'admin
    const responseMessage = populatedMessage.toObject();
    if (responseMessage.senderId && responseMessage.senderId.role === 'admin') {
      responseMessage.senderId.name = 'Promoto';
    }
    if (responseMessage.receiverId && responseMessage.receiverId.role === 'admin') {
      responseMessage.receiverId.name = 'Promoto';
    }

    res.status(201).json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtenir les conversations d'un utilisateur
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Obtenir tous les utilisateurs avec qui l'utilisateur a eu des conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          'user.password': 0,
        },
      },
      {
        $addFields: {
          'user.name': {
            $cond: [
              { $eq: ['$user.role', 'admin'] },
              'Promoto',
              '$user.name'
            ]
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .populate('senderId', 'name email avatar role')
      .populate('receiverId', 'name email avatar role')
      .populate('appointmentId', 'date time serviceId')
      .sort({ createdAt: 1 });

    // Remplacer le nom de l'admin par "Promoto" dans tous les messages
    messages.forEach(msg => {
      if (msg.senderId && msg.senderId.role === 'admin') {
        msg.senderId.name = 'Promoto';
      }
      if (msg.receiverId && msg.receiverId.role === 'admin') {
        msg.receiverId.name = 'Promoto';
      }
    });

    // Marquer les messages comme lus
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer les messages comme lus
// @route   PUT /api/messages/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.json({
      success: true,
      message: 'Messages marqués comme lus',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

