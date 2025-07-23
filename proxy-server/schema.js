const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  api_key:{
    type: String,
    required: true,
    default: ''
  }
}, {
  timestamps: true
});


const userConfigSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  config: {
    DB_HOST: {
      type: String,
      required: true
    },
    DB_PORT: {
      type: Number,
      default: 3306
    },
    DB_USER: {
      type: String,
      required: true
    },
    DB_PASS: {
      type: String,
      default: ''
    },
    DB_NAME: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

const queryLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query_text: {
    type: String,
    required: true
  },
  execution_time_ms: {
    type: Number,
    required: true
  },
  suspicious: {
    type: Boolean,
    default: false
  },
  feedback: [{
    type: {
      type: String
    },
    severity: String,
    message: String
  }],
  query_type: {
    type: String,
    enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'OTHER'],
    default: 'OTHER'
  },
  affected_rows: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const UserConfig = mongoose.model('UserConfig', userConfigSchema);
const QueryLog = mongoose.model('QueryLog', queryLogSchema);

module.exports = {
  User,
  UserConfig,
  QueryLog
};