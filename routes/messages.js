let express = require('express')
let router = express.Router()
let { CheckLogin } = require('../utils/authHandler')
let messageModel = require('../schemas/messages')
let { uploadImage } = require('../utils/uploadHandler')
let multer = require('multer')
let path = require('path')
let multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        let newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, newFileName)
    }
})
let uploadFile = multer({ storage: multerStorage })

// GET /:userID - lấy toàn bộ tin nhắn giữa user hiện tại và userID
router.get('/:userID', CheckLogin, async function (req, res, next) {
    try {
        let currentUser = req.user._id
        let targetUser = req.params.userID

        let messages = await messageModel.find({
            $or: [
                { from: currentUser, to: targetUser },
                { from: targetUser, to: currentUser }
            ]
        })
            .populate('from', 'username email avatarUrl')
            .populate('to', 'username email avatarUrl')
            .sort({ createdAt: 1 })

        res.send(messages)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// POST / - gửi tin nhắn (text hoặc file)
router.post('/', CheckLogin, uploadFile.single('file'), async function (req, res, next) {
    try {
        let currentUser = req.user._id
        let { to, text } = req.body

        if (!to) {
            return res.status(400).send({ message: 'Thiếu trường to (userID người nhận)' })
        }

        let messageContent = {}

        if (req.file) {
            // Có file đính kèm
            messageContent.type = 'file'
            messageContent.text = req.file.path
        } else {
            // Tin nhắn text thuần
            if (!text) {
                return res.status(400).send({ message: 'Thiếu nội dung tin nhắn (text)' })
            }
            messageContent.type = 'text'
            messageContent.text = text
        }

        let newMessage = new messageModel({
            from: currentUser,
            to: to,
            messageContent: messageContent
        })

        newMessage = await newMessage.save()
        newMessage = await newMessage.populate('from', 'username email avatarUrl')
        newMessage = await newMessage.populate('to', 'username email avatarUrl')

        res.send(newMessage)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// GET / - lấy tin nhắn cuối cùng của mỗi cuộc hội thoại
router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let currentUser = req.user._id

        // Lấy tất cả tin nhắn liên quan đến user hiện tại
        let messages = await messageModel.find({
            $or: [
                { from: currentUser },
                { to: currentUser }
            ]
        })
            .populate('from', 'username email avatarUrl')
            .populate('to', 'username email avatarUrl')
            .sort({ createdAt: -1 })

        // Nhóm theo từng cặp user, lấy tin nhắn cuối cùng
        let conversationMap = new Map()

        for (let msg of messages) {
            let fromId = msg.from._id.toString()
            let toId = msg.to._id.toString()
            let currentId = currentUser.toString()

            // Xác định user đối thoại (người kia)
            let partnerId = fromId === currentId ? toId : fromId

            // Vì đã sort -1 (mới nhất trước), phần tử đầu tiên là tin nhắn cuối
            if (!conversationMap.has(partnerId)) {
                conversationMap.set(partnerId, msg)
            }
        }

        let lastMessages = Array.from(conversationMap.values())

        res.send(lastMessages)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

module.exports = router
