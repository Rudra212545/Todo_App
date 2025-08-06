import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  // Attempt to retrieve token from cookie
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // fallback to Authorization header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id, // adapt based on your token payload
      email: decoded.email,
      username: decoded.username
    };
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
