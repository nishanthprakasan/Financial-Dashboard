import mongoose from 'mongoose';
import { createHmac, randomBytes } from 'node:crypto';

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },

  password: {
    type: String,
    required: function() {
      return this.loginMethod === 'email';
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false 
  },

  salt: {
    type: String,
    select: false
  },

  onboardingCompleted: {
    type: Boolean,
    default: false
  },

  avatar: {
    type: String,
    default: ''
  },

  usagePurpose: {
    type: String,
    enum: ['personal', 'business', 'freelancer', 'student', 'family', 'other'],
    default: 'personal'
  },

  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY', 'SGD']
  },

  financialGoals: [{
    type: String,
    enum: ['save_money', 'track_spending', 'budgeting', 'debt_free', 'investing', 'retirement', 'emergency_fund']
  }],

  monthlyIncome: {
    type: Number,
    default: 0
  },

  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true }
  },

  googleId: {
    type: String,
    sparse: true 
  },

  loginMethod: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  verificationToken: String,
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = randomBytes(16).toString('hex');
  const hashedPassword = createHmac('sha256', salt)
    .update(this.password)
    .digest('hex');

  this.salt = salt;
  this.password = hashedPassword;
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  const hashedPassword = createHmac('sha256', this.salt)
    .update(enteredPassword)
    .digest('hex');
  
  return this.password === hashedPassword;
};

userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    currency: this.currency,
    loginMethod: this.loginMethod,
    emailVerified: this.emailVerified,
    onboardingCompleted: this.onboardingCompleted,
    createdAt: this.createdAt
  };
};

userSchema.statics.findOrCreateGoogleUser = async function(googleData) {
  let user = await this.findOne({ 
    $or: [
      { googleId: googleData.sub },
      { email: googleData.email }
    ]
  });

  if (!user) {
    user = await this.create({
      googleId: googleData.sub,
      name: googleData.name,
      email: googleData.email,
      avatar: googleData.picture,
      loginMethod: 'google',
      emailVerified: true,
      password: 'google-auth',
      salt: randomBytes(16).toString('hex') 
    });
  } else if (!user.googleId) {
    user.googleId = googleData.sub;
    user.avatar = googleData.picture || user.avatar;
    user.loginMethod = 'google';
    await user.save();
  }

  return user;
};

const User = mongoose.model('User', userSchema);

export default User;