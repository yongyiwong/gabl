const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    firebaseId: {
      type: String,
      index: true
    },
    email: {
      type: String,
      index: true,
      unique: true
    },
    blocked: {
      type: Boolean,
      default: false
    },
    picture: String,
    fullname: String,
    username: String,
    role: {
      type: String,
      required: true,
      enum: ['admin', 'user']
    },
    quizAnswers: [Number]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true }
  }
);

const UserModel = mongoose.model('User', UserSchema);

module.exports = {
  UserModel
};
