import { gql } from 'apollo-server-express';
import mongoose from 'mongoose';
import { Twilio } from 'twilio';

class TwilioService {
  twilio: Twilio;
  verifyService;

  constructor() {
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  async init() {
    this.verifyService = await this.twilio.verify.services.create({
      friendlyName: 'gabl-verify',
    });
  }

  async verifyNumber(number) {
    return await this.twilio.lookups.phoneNumbers(number).fetch();
  }

  async createConversation(title) {
    return await this.twilio.conversations.v1.conversations.create({
      friendlyName: title || 'Conversation Room',
    });
  }

  async createParticipant({ conversationId, userId }) {
    return await this.twilio.conversations.v1
      .conversations(conversationId)
      .participants.create({ identity: userId.toString() });
  }

  async deleteParticipant({ conversationId, participantId }) {
    try {
      return await this.twilio.conversations.v1
        .conversations(conversationId)
        .participants(participantId)
        .remove();
    } catch (e) {
      return false;
    }
  }

  async getMessage({ conversationId, messageId }) {
    try {
      return await this.twilio.conversations.v1
        .conversations(conversationId)
        .messages(messageId);
    } catch (e) {
      return null;
    }
  }
}

const TwilioLookupCarrierSchema = new mongoose.Schema({
  errorCode: String,
  mobileCountryCode: String,
  mobileNetworkCode: String,
  name: String,
  type: String,
});

const TwilioLookupResponseSchema = new mongoose.Schema({
  callerName: String,
  carrier: TwilioLookupCarrierSchema,
  countryCode: String,
  nationalFormat: String,
  phoneNumber: String,
  addOns: String,
  url: String,
});

export { TwilioService, TwilioLookupCarrierSchema, TwilioLookupResponseSchema };
