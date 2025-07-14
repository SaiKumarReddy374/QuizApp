import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note the `.js` extension is required
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: User not found for email:", email);
      return res.status(401).json({ error: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed: Wrong password for email:", email);
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

   res.cookie('token', token, {
      httpOnly: true,
      secure:process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log(`User logged in: ${email}`);
    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        token: token, // optional
      }
    });
  } catch (err) {
    console.log("Login error:", err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    console.log(`User registered: ${email} as ${role}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("Registration error:", err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};


export const logout = (req, res) => {
  res.clearCookie('token');
  console.log("User logged out.");
  res.json({ message: 'Logged out successfully' });
};
