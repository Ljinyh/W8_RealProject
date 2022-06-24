const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10 //10자리로 암호화

const UserSchema = new mongoose.Schema({
    userId: String,
    email: String,
    password: String,
    confirmPassword: String,
})

//비밀번호 암호화
UserSchema.pre('save', function (next) {
    const user = this

    // user가 password를 바꿀때만 hashing
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                return next(err)
            }

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err)
                }
                user.password = hash
                next()
            })
        })
    }
})

UserSchema.virtual('authorId').get(function () {
    return this._id.toHexString()
})
UserSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('User', UserSchema)
