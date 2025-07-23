const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("./schema");
const dotenv = require("dotenv");
dotenv.config();



const JWT_SECRET = process.env.JWT_SECRET 

async function registerUser(username, email, password) {
  try {
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }


    const hashedPassword = await bcrypt.hash(password, 10);

   
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();

    return {
      id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("User already exists");
    }
    throw error;
  }
}


async function authenticateUser(email, password) {
  try {

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
  } catch (error) {
    throw error;
  }
}


function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ 
      error: "Unauthorized - No token provided",
      status: "error" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token expired",
        status: "error" 
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid token",
        status: "error" 
      });
    } else {
      return res.status(401).json({ 
        error: "Token verification failed",
        status: "error" 
      });
    }
  }
}
async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    // Try API key check first
    const userByApiKey = await User.findOne({ api_key: token });
    if (userByApiKey) {
      req.user = { id: userByApiKey._id };
      return next();
    }

    // If not found, try decoding as JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token or API key" });
    }
  }

  // If no Authorization header, try cookie
  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token in cookie" });
    }
  }

  // If no auth provided at all
  return res.status(401).json({ error: "Unauthorized - No token or API key" });
}




async function getUserById(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      created_at: user.createdAt,
    };
  } catch (error) {
    throw error;
  }
}

async function updateUser(userId, updates) {
  try {
    
    const { password, ...safeUpdates } = updates;
    
    const user = await User.findByIdAndUpdate(
      userId,
      safeUpdates,
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      updated_at: user.updatedAt,
    };
  } catch (error) {
    throw error;
  }
}


async function changePassword(userId, currentPassword, newPassword) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

 
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    
    user.password = hashedNewPassword;
    await user.save();

    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerUser,
  authenticateUser,
  generateToken,
  verifyToken,
  getUserById,
  updateUser,
  changePassword,
  verifyAuth
};
