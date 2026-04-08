const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateAccessToken = require("../utils/generateToken");
const ROLES = require("../constants/roles");

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => email?.trim().toLowerCase();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const generateAuthResponse = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

const createParentUser = async ({
  ime,
  prezime,
  email,
  password,
  telefon,
  role = ROLES.RODITELJ,
  deca = [],
  session = null,
}) => {
  const normalizedEmail = normalizeEmail(email);

  const userExists = await User.findOne({ email: normalizedEmail }).session(
    session,
  );
  if (userExists) {
    throw createError("Korisnik sa ovom email adresom već postoji", 400);
  }

  const hashedPassword = await hashPassword(password);

  const createdUsers = await User.create(
    [
      {
        ime: ime?.trim(),
        prezime: prezime?.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        telefon: telefon?.trim(),
        role,
        deca: Array.isArray(deca) ? deca : [],
      },
    ],
    session ? { session } : {},
  );

  const user = createdUsers[0];

  return user;
};

exports.registerUser = async (data) => {
  const { ime, prezime, email, password, telefon, role, deca } = data;

  const userRole = role === ROLES.VLASNIK ? ROLES.VLASNIK : ROLES.RODITELJ;

  const user = await createParentUser({
    ime,
    prezime,
    email,
    password,
    telefon,
    role: userRole,
    deca,
  });

  const tokens = generateAuthResponse(user);

  return { user, ...tokens };
};

exports.loginUser = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw createError("Pogrešan email ili lozinka", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createError("Pogrešan email ili lozinka", 401);
  }

  const tokens = generateAuthResponse(user);

  return { user, ...tokens };
};

exports.refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw createError("Niste autorizovani", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw createError("Refresh token je istekao", 401);
    }

    throw createError("Refresh token nije validan", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw createError("Korisnik ne postoji", 401);
  }

  const accessToken = generateAccessToken(user);

  return { accessToken };
};

exports.registerGuestParent = async (data, session = null) => {
  const { ime, prezime, email, password, telefon } = data;

  const normalizedEmail = normalizeEmail(email);

  const userExists = await User.findOne({ email: normalizedEmail }).session(
    session,
  );
  if (userExists) {
    throw createError(
      "Korisnik sa ovom email adresom već postoji. Prijavite se da biste završili rezervaciju.",
      400,
    );
  }

  const user = await createParentUser({
    ime,
    prezime,
    email: normalizedEmail,
    password,
    telefon,
    role: ROLES.RODITELJ,
    deca: [],
    session,
  });

  const { accessToken, refreshToken } = generateAuthResponse(user);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

exports.cookieOptions = REFRESH_TOKEN_COOKIE_OPTIONS;
